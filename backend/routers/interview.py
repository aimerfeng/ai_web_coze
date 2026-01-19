from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from typing import Optional
import json
import logging
import auth
from controller import InterviewController

router = APIRouter(tags=["interview"])

logger = logging.getLogger("server")
controller = InterviewController()

@router.websocket("/ws/interview")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    # Verify Token
    try:
        if token is None:
             await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
             return
        
        # Manually decode token here as Depends doesn't work easily with WS in some versions
        # Or use a query param "token"
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
    except Exception as e:
        logger.error(f"Auth failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    logger.info(f"New WebSocket connection: {email}")
    
    # Register the connection with the controller
    session_id = str(id(websocket))
    await controller.connect(session_id, websocket)
    
    try:
        while True:
            # Expecting JSON messages or Binary audio/video
            message = await websocket.receive()
            
            if "text" in message:
                try:
                    data = json.loads(message["text"])
                    if data.get("type") == "PING":
                         await websocket.send_json({"type": "PONG"})
                    else:
                        await controller.handle_event(session_id, data)
                except:
                    pass
            elif "bytes" in message:
                # Assuming bytes are audio chunks for now
                await controller.handle_audio_stream(session_id, message["bytes"])
                
    except WebSocketDisconnect:
        controller.disconnect(session_id)
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"Error: {e}")
        controller.disconnect(session_id)
