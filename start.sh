#!/usr/bin/env bash
# This script is executed by Render's Linux environment

# Exit immediately if a command exits with a non-zero status
set -e

# Use Gunicorn to run your ASGI application.
# Render automatically provides the $PORT environment variable.
gunicorn backend.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT