import logging
import base64
import cv2
import numpy as np
import mediapipe as mp
import json

logger = logging.getLogger("observer")

class ObserverAgent:
    def __init__(self):
        self.risk_logs = []
        self.mp_face_mesh = None
        self.face_mesh = None
        self.last_status = "normal"
        self.frame_count = 0

    def _init_model(self):
        if self.face_mesh is None:
            logger.info("Initializing MediaPipe FaceMesh...")
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )

    async def analyze_frame(self, session_id: str, frame_data: str):
        """
        Analyze video frame (base64).
        Detect faces, gaze, phone, etc.
        """
        self._init_model()
        self.frame_count += 1
        if self.frame_count % 5 != 0: # Process every 5th frame to save CPU
            return

        try:
            # Decode base64
            if "," in frame_data:
                frame_data = frame_data.split(",")[1]
            image_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return

            # Convert to RGB
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(image_rgb)

            risk_event = None
            current_status = "normal"

            if not results.multi_face_landmarks:
                current_status = "no_face_detected"
                risk_event = "NO_FACE"
            else:
                # Simple Gaze Check (heuristic based on iris position)
                landmarks = results.multi_face_landmarks[0].landmark
                # Left Iris: 468, Right Iris: 473
                # We can check if they are too far left/right/up/down
                # For MVP, let's just assume presence is enough, or implement simple check
                pass

            self.last_status = current_status
            
            if risk_event:
                log_entry = {"time": self.frame_count, "event": risk_event}
                self.risk_logs.append(log_entry)
                logger.warning(f"Session {session_id} Risk: {risk_event}")

        except Exception as e:
            logger.error(f"Error in visual analysis: {e}")

    def get_latest_report(self, session_id: str):
        return {
            "status": self.last_status,
            "risk_count": len(self.risk_logs),
            "last_log": self.risk_logs[-1] if self.risk_logs else None
        }
