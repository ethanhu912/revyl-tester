const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function startScan(onTest, onDone, onError, signal) {
    const response = await fetch(`${API_URL}/api/scan`, { method: 'POST', signal });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = null;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
            if (line.startsWith('event: ')) {
                currentEvent = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
                const raw = line.slice(6).trim();
                if (!raw || raw === '{}') {
                    if (currentEvent === 'done') onDone();
                    currentEvent = null;
                    continue;
                }
                try {
                    const parsed = JSON.parse(raw);
                    if (currentEvent === 'error' || parsed.error) {
                        onError(parsed.error || 'Unknown error');
                    } else {
                        onTest(parsed);
                    }
                } catch {}
                currentEvent = null;
            }
        }
    }

    onDone();
}

export async function saveTest(test) {
    const res = await fetch(`${API_URL}/api/tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test),
    });
    return res.json();
}

export async function getTests() {
    const res = await fetch(`${API_URL}/api/tests`);
    return res.json();
}
