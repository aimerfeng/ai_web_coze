import sys
import os
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("launcher")

# Add backend directory to sys.path so we can import modules directly
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if backend_dir not in sys.path:
    sys.path.append(backend_dir)
    logger.info(f"Added {backend_dir} to sys.path")

if __name__ == "__main__":
    try:
        logger.info("Importing app from main...")
        # Import directly from 'main' module, treating 'backend' dir as root
        from main import app
        
        logger.info("Starting Uvicorn server...")
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        import traceback
        traceback.print_exc()
