import { useState } from 'react';
import { saveTest } from '../lib/api';

export default function TestCard({ test, onAdded }) {
    const [expanded, setExpanded] = useState(false);
    const [added, setAdded] = useState(false);

    async function handleAdd() {
        await saveTest(test);
        setAdded(true);
        onAdded(test);
    }

    return (
        <div style={styles.card}>
            <div style={styles.header} onClick={() => setExpanded(e => !e)}>
                <div>
                    <span style={styles.priority(test.priority)}>{test.priority}</span>
                    <strong style={{ marginLeft: 8 }}>{test.title}</strong>
                    <span style={styles.screen}>{test.screen}</span>
                </div>
                <span>{expanded ? '▲' : '▼'}</span>
            </div>

            {expanded && (
                <div style={styles.body}>
                    <p style={styles.label}>Steps</p>
                    <ol style={styles.steps}>
                        {test.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                    <p style={styles.label}>Expected</p>
                    <p>{test.expected}</p>
                </div>
            )}

            <div style={styles.footer}>
                <button
                    onClick={handleAdd}
                    disabled={added}
                    style={styles.button(added)}
                >
                    {added ? 'Added to Suite' : 'Add to Suite'}
                </button>
            </div>
        </div>
    );
}

const styles = {
    card: {
        border: '1px solid #333',
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: '#1a1a1a',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        cursor: 'pointer',
    },
    priority: (p) => ({
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: p === 'High' ? '#7f1d1d' : p === 'Medium' ? '#78350f' : '#1e3a5f',
        color: '#fff',
    }),
    screen: {
        marginLeft: 12,
        fontSize: 12,
        color: '#888',
    },
    body: {
        padding: '0 16px 12px',
        borderTop: '1px solid #333',
    },
    label: {
        fontSize: 11,
        color: '#888',
        textTransform: 'uppercase',
        marginTop: 12,
        marginBottom: 4,
    },
    steps: {
        paddingLeft: 20,
        margin: 0,
        lineHeight: 1.7,
    },
    footer: {
        padding: '8px 16px',
        borderTop: '1px solid #222',
    },
    button: (added) => ({
        padding: '6px 14px',
        backgroundColor: added ? '#333' : '#2563eb',
        color: added ? '#888' : '#fff',
        border: 'none',
        borderRadius: 6,
        cursor: added ? 'default' : 'pointer',
        fontSize: 13,
    }),
};
