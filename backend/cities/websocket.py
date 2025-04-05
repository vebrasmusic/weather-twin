from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, request_id: str):
        await websocket.accept()
        self.active_connections.update({request_id: websocket})

    def disconnect(self, request_id: str):
        self.active_connections.pop(request_id)

    async def send_message(self, message: str, request_id: str):
        ws = self.active_connections.get(request_id)
        if ws is None:
            raise ValueError("No websocket with that request Id")
        await ws.send_text(message)
