import { useRef, useState } from 'react';
import { startScan } from '../lib/api';
import TestCard from './TestCard';

export default function Scanner({ onTestAdded }) {
    const [scanning, setScanning] = useState(false);
    const [tests, setTests] = useState([]);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const abortRef = useRef(null);

    async function handleScan() {
        const controller = new AbortController();
        abortRef.current = controller;
        setScanning(true);
        setTests([]);
        setError(null);
        setDone(false);

        try {
            await startScan(
                (test) => setTests(prev => [...prev, test]),
                () => { setScanning(false); setDone(true); },
                (err) => { setError(err); setScanning(false); },
                controller.signal,
            );
        } catch (e) {
            if (e.name !== 'AbortError') setError(e.message);
            setScanning(false);
            setDone(true);
        }
    }

    function handleStop() {
        abortRef.current?.abort();
    }

    return (
        <div>
            <div style={styles.header}>
                <div>
                    <h2 style={{ margin: 0 }}>App Scanner</h2>
                    <p style={styles.sub}>Claude will explore bug-bazaar and generate test recommendations.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleScan} disabled={scanning} style={styles.button(scanning)}>
                        {scanning ? 'Scanning...' : 'Scan App'}
                    </button>
                    {scanning && (
                        <button onClick={handleStop} style={styles.stopButton}>Stop</button>
                    )}
                </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            {scanning && tests.length === 0 && (
                <p style={styles.hint}>Booting device and starting exploration...</p>
            )}

            {tests.length > 0 && (
                <div style={{ marginTop: 24 }}>
                    <p style={styles.hint}>
                        {done ? `Found ${tests.length} test cases.` : `Generating... ${tests.length} so far`}
                    </p>
                    {tests.map((t, i) => (
                        <TestCard key={i} test={t} onAdded={onTestAdded} />
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    sub: {
        color: '#888',
        margin: '4px 0 0',
        fontSize: 14,
    },
    button: (disabled) => ({
        padding: '10px 20px',
        backgroundColor: disabled ? '#333' : '#2563eb',
        color: disabled ? '#888' : '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 14,
        whiteSpace: 'nowrap',
    }),
    hint: {
        color: '#888',
        fontSize: 13,
        marginBottom: 16,
    },
    error: {
        color: '#f87171',
        backgroundColor: '#450a0a',
        padding: '10px 14px',
        borderRadius: 6,
        fontSize: 13,
    },
    stopButton: {
        padding: '10px 20px',
        backgroundColor: 'transparent',
        color: '#f87171',
        border: '1px solid #f87171',
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 14,
    },
};
