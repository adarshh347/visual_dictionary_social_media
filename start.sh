#!/bin/bash
# This script is executed by Render's Linux environment

set -e  # Exit on error

# Remove standalone bson package if it exists (it conflicts with pymongo's bson)
# pymongo includes its own bson module bundled, so standalone bson causes conflicts
echo "Checking for conflicting standalone bson package..."
if pip show bson &>/dev/null; then
    echo "Removing standalone bson package..."
    pip uninstall -y bson
fi

# Set PYTHONPATH to current directory so 'backend' imports work correctly
export PYTHONPATH="${PWD}:${PYTHONPATH}"

# Use Gunicorn to run your ASGI application
# Render automatically provides the $PORT environment variable
# Using 2 workers for free tier
exec gunicorn backend.main:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120