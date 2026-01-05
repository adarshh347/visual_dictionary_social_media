// Check if backend is running
async function checkConnection() {
    const statusEl = document.getElementById('status');

    try {
        const response = await fetch('http://localhost:5007/api/v1/posts/?limit=1');
        if (response.ok) {
            statusEl.className = 'status connected';
            statusEl.textContent = '✓ Connected to Sharirasutra';
        } else {
            throw new Error('Not OK');
        }
    } catch (error) {
        statusEl.className = 'status disconnected';
        statusEl.textContent = '✗ Backend not running (start with uvicorn)';
    }
}

// Check on popup open
checkConnection();
