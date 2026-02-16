#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import importlib.util
import sqlite3
import tempfile
from pathlib import Path


def _load_server_py():
    here = Path(__file__).resolve()
    server_py = here.parents[1] / "server.py"
    spec = importlib.util.spec_from_file_location("autonovelwriter_backend_server", server_py)
    assert spec and spec.loader, "failed to create import spec for server.py"
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    return mod


_server = _load_server_py()


async def _run() -> None:
    with tempfile.TemporaryDirectory(prefix="anw_chat_store_") as td:
        root = Path(td)
        chat_jsonl = root / "state" / "chat.jsonl"
        chat_db = root / "state" / "chat.sqlite3"

        store = _server.ChatStore(chat_jsonl, chat_sqlite=chat_db, max_in_memory=10)
        await store.load_tail(limit=10)
        msg = {
            "id": "msg-1",
            "ts_ms": 1739680000000,
            "role": "user",
            "source": "ui",
            "text": "hello sqlite",
        }
        await store.append(msg)
        tail = await store.tail(limit=5)
        assert tail and tail[-1].get("id") == "msg-1"

        assert chat_db.exists(), "chat sqlite should be created"
        with sqlite3.connect(str(chat_db)) as conn:
            row = conn.execute("SELECT id, text FROM chat_messages WHERE id = ?", ("msg-1",)).fetchone()
        assert row is not None, "message should be persisted in sqlite"
        assert row[0] == "msg-1"
        assert row[1] == "hello sqlite"


def test_chat_store_sqlite_append() -> None:
    asyncio.run(_run())


if __name__ == "__main__":
    test_chat_store_sqlite_append()
    print("ok - chat_store_sqlite_unit")

