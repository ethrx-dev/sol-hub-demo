import json
from fastapi import WebSocket
from typing import Any


class ConnectionManager:
    def __init__(self):
        self._rooms: dict[str, set[WebSocket]] = {}

    async def join(self, room: str, ws: WebSocket) -> None:
        if room not in self._rooms:
            self._rooms[room] = set()
        self._rooms[room].add(ws)

    async def leave(self, room: str, ws: WebSocket) -> None:
        if room in self._rooms:
            self._rooms[room].discard(ws)
            if not self._rooms[room]:
                del self._rooms[room]

    async def broadcast(self, room: str, event: str, data: Any) -> None:
        if room not in self._rooms:
            return
        payload = json.dumps({"event": event, "data": data})
        stale = set()
        for ws in self._rooms[room]:
            try:
                await ws.send_text(payload)
            except Exception:
                stale.add(ws)
        for ws in stale:
            self._rooms[room].discard(ws)
        if not self._rooms[room]:
            del self._rooms[room]


manager = ConnectionManager()
