#!/usr/bin/env python3
"""Small authenticated reverse proxy for publishing AutoNovelWriter via ngrok.

The proxy serves the PWA from the local `pwa/` directory and forwards `/api/*`
requests to the Tornado backend. All routes require a username/token login
except the login form itself.
"""

from __future__ import annotations

import argparse
import hmac
import html
import http.client
import http.server
import os
import posixpath
import shutil
import urllib.parse
from pathlib import Path


COOKIE_NAME = "autonovelwriter_session"
PUBLIC_ASSETS = {
    "/autonovelwriter-icon.svg",
    "/autonovelwriter-icon-192.png",
    "/autonovelwriter-icon-512.png",
    "/favicon.svg",
    "/manifest.json",
}


def _cookie_signature(username: str, token: str) -> str:
    return hmac.new(token.encode("utf-8"), username.encode("utf-8"), "sha256").hexdigest()


def _html_page(title: str, body: str) -> bytes:
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{html.escape(title)}</title>
    <style>
      :root {{ color-scheme: light; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial; }}
      body {{ min-height: 100vh; margin: 0; display: grid; place-items: center; background: #f6f7fb; color: #20242f; }}
      main {{ width: min(420px, calc(100vw - 32px)); padding: 28px; border: 1px solid rgba(30,40,60,.12); border-radius: 20px; background: #fff; box-shadow: 0 18px 60px rgba(12,18,28,.10); }}
      h1 {{ margin: 0 0 8px; font-size: 22px; }}
      p {{ margin: 0 0 18px; color: rgba(20,24,33,.66); line-height: 1.45; }}
      label {{ display: block; margin: 12px 0 6px; font-size: 12px; font-weight: 800; color: rgba(20,24,33,.70); }}
      input {{ width: 100%; box-sizing: border-box; border: 1px solid rgba(30,40,60,.14); border-radius: 12px; padding: 12px; font-size: 14px; }}
      button {{ width: 100%; margin-top: 18px; border: 0; border-radius: 14px; padding: 13px; color: #fff; background: #2767ff; font-weight: 900; cursor: pointer; }}
      .error {{ color: #b42318; font-weight: 700; }}
    </style>
  </head>
  <body>
    <main>{body}</main>
  </body>
</html>
""".encode("utf-8")


def make_handler(*, pwa_dir: Path, backend_host: str, backend_port: int, username: str, token: str):
    expected_cookie = _cookie_signature(username, token)

    class AuthProxyHandler(http.server.SimpleHTTPRequestHandler):
        server_version = "AutoNovelWriterPublicProxy/1.0"

        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(pwa_dir), **kwargs)

        def log_message(self, fmt: str, *args) -> None:
            print(f"[public-proxy] {self.address_string()} - {fmt % args}", flush=True)

        def _is_authenticated(self) -> bool:
            raw = self.headers.get("Cookie", "")
            for part in raw.split(";"):
                if "=" not in part:
                    continue
                key, value = part.strip().split("=", 1)
                if key == COOKIE_NAME and hmac.compare_digest(value, expected_cookie):
                    return True
            return False

        def _send_bytes(self, status: int, body: bytes, content_type: str = "text/html; charset=utf-8") -> None:
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(body)

        def _redirect(self, target: str) -> None:
            self.send_response(303)
            self.send_header("Location", target)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()

        def _login_form(self, error: str = "") -> None:
            err = f'<p class="error">{html.escape(error)}</p>' if error else ""
            body = f"""
              <h1>AutoNovelWriter Login</h1>
              <p>Enter the local username and access token before opening the writing studio.</p>
              {err}
              <form method="post" action="/login">
                <label for="username">Username</label>
                <input id="username" name="username" autocomplete="username" autofocus />
                <label for="token">Token</label>
                <input id="token" name="token" type="password" autocomplete="current-password" />
                <button type="submit">Login</button>
              </form>
            """
            self._send_bytes(200, _html_page("AutoNovelWriter Login", body))

        def _handle_login(self) -> None:
            length = int(self.headers.get("Content-Length", "0") or "0")
            data = self.rfile.read(length).decode("utf-8", errors="replace")
            form = urllib.parse.parse_qs(data)
            submitted_username = form.get("username", [""])[0]
            submitted_token = form.get("token", [""])[0]
            ok = hmac.compare_digest(submitted_username, username) and hmac.compare_digest(submitted_token, token)
            if not ok:
                self._login_form("Invalid username or token.")
                return
            self.send_response(303)
            self.send_header("Location", "/")
            self.send_header(
                "Set-Cookie",
                f"{COOKIE_NAME}={expected_cookie}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax",
            )
            self.send_header("Cache-Control", "no-store")
            self.end_headers()

        def _logout(self) -> None:
            self.send_response(303)
            self.send_header("Location", "/login")
            self.send_header("Set-Cookie", f"{COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()

        def _require_auth(self) -> bool:
            if self.path.startswith("/login"):
                return True
            if self.path.startswith("/logout"):
                return True
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path in PUBLIC_ASSETS:
                return True
            if self._is_authenticated():
                return True
            self._redirect("/login")
            return False

        def do_GET(self) -> None:  # noqa: N802
            if self.path.startswith("/login"):
                self._login_form()
                return
            if self.path.startswith("/logout"):
                self._logout()
                return
            if not self._require_auth():
                return
            if self.path.startswith("/api/"):
                self._proxy_to_backend()
                return
            self._serve_pwa()

        def do_HEAD(self) -> None:  # noqa: N802
            if self.path.startswith("/login"):
                body = _html_page("AutoNovelWriter Login", "")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-store")
                self.send_header("X-Frame-Options", "DENY")
                self.send_header("X-Content-Type-Options", "nosniff")
                self.end_headers()
                return
            if self.path.startswith("/logout"):
                self._logout()
                return
            if not self._require_auth():
                return
            if self.path.startswith("/api/"):
                self._proxy_to_backend(write_body=False)
                return
            self._serve_pwa_head()

        def do_POST(self) -> None:  # noqa: N802
            if self.path.startswith("/login"):
                self._handle_login()
                return
            if not self._require_auth():
                return
            if self.path.startswith("/api/"):
                self._proxy_to_backend()
                return
            self.send_error(404)

        def do_PUT(self) -> None:  # noqa: N802
            if not self._require_auth():
                return
            if self.path.startswith("/api/"):
                self._proxy_to_backend()
                return
            self.send_error(404)

        def do_DELETE(self) -> None:  # noqa: N802
            if not self._require_auth():
                return
            if self.path.startswith("/api/"):
                self._proxy_to_backend()
                return
            self.send_error(404)

        def _resolve_pwa_path(self) -> None:
            parsed = urllib.parse.urlparse(self.path)
            clean_path = posixpath.normpath(urllib.parse.unquote(parsed.path))
            if clean_path in ("", "/", "."):
                self.path = "/index.html"
            else:
                candidate = pwa_dir / clean_path.lstrip("/")
                if not candidate.exists() or candidate.is_dir():
                    self.path = "/index.html"

        def _serve_pwa(self) -> None:
            self._resolve_pwa_path()
            return super().do_GET()

        def _serve_pwa_head(self) -> None:
            self._resolve_pwa_path()
            return super().do_HEAD()

        def _proxy_to_backend(self, *, write_body: bool = True) -> None:
            body = b""
            if self.command in {"POST", "PUT", "PATCH"}:
                length = int(self.headers.get("Content-Length", "0") or "0")
                body = self.rfile.read(length)
            headers = {}
            for key, value in self.headers.items():
                lk = key.lower()
                if lk in {"host", "connection", "content-length", "accept-encoding", "cookie"}:
                    continue
                headers[key] = value
            if body:
                headers["Content-Length"] = str(len(body))
            conn = http.client.HTTPConnection(backend_host, backend_port, timeout=60)
            try:
                conn.request(self.command, self.path, body=body, headers=headers)
                res = conn.getresponse()
                data = res.read()
                self.send_response(res.status, res.reason)
                for key, value in res.getheaders():
                    lk = key.lower()
                    if lk in {"connection", "transfer-encoding", "content-length", "content-encoding"}:
                        continue
                    self.send_header(key, value)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                if write_body:
                    self.wfile.write(data)
            except Exception as exc:  # pragma: no cover - operational fallback
                msg = f"Backend proxy error: {type(exc).__name__}: {exc}".encode("utf-8")
                self._send_bytes(502, msg, "text/plain; charset=utf-8")
            finally:
                conn.close()

    return AuthProxyHandler


def main() -> None:
    parser = argparse.ArgumentParser(description="Authenticated local proxy for AutoNovelWriter.")
    parser.add_argument("--host", default=os.environ.get("AUTONOVELWRITER_PUBLIC_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("AUTONOVELWRITER_PUBLIC_PORT", "18080")))
    parser.add_argument("--pwa-dir", default=os.environ.get("AUTONOVELWRITER_PWA_DIR", "pwa"))
    parser.add_argument("--backend-host", default=os.environ.get("AUTOAPPDEV_HOST", "127.0.0.1"))
    parser.add_argument("--backend-port", type=int, default=int(os.environ.get("AUTOAPPDEV_PORT", "8788")))
    args = parser.parse_args()

    username = os.environ.get("AUTONOVELWRITER_PUBLIC_USERNAME", "").strip()
    token = os.environ.get("AUTONOVELWRITER_PUBLIC_TOKEN", "").strip()
    if not username or not token:
        raise SystemExit("AUTONOVELWRITER_PUBLIC_USERNAME and AUTONOVELWRITER_PUBLIC_TOKEN are required")

    pwa_dir = Path(args.pwa_dir).resolve()
    if not pwa_dir.is_dir():
        raise SystemExit(f"PWA directory does not exist: {pwa_dir}")

    handler = make_handler(
        pwa_dir=pwa_dir,
        backend_host=args.backend_host,
        backend_port=args.backend_port,
        username=username,
        token=token,
    )

    with http.server.ThreadingHTTPServer((args.host, args.port), handler) as server:
        print(
            f"[public-proxy] serving {pwa_dir} at http://{args.host}:{args.port}; "
            f"proxying /api to http://{args.backend_host}:{args.backend_port}",
            flush=True,
        )
        try:
            server.serve_forever()
        finally:
            server.server_close()


if __name__ == "__main__":
    main()
