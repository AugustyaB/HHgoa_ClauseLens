import sys
import os

# Add Backend directory to Python path for Vercel Serverless Function deployment
backend_dir = os.path.join(os.path.dirname(__file__), "..", "Backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

# Vercel serverless entry point
app = app
