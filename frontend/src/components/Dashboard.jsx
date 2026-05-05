export default function Dashboard({ tests }) {
    if (tests.length === 0) {
        return <p style={{ color: '#888', textAlign: 'center', marginTop: 60 }}>No tests added yet. Go to Generator and scan the app.</p>;
    }

    return (
        <div>
            <h2 style={{ marginBottom: 20 }}>Test Suite</h2>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Test Name</th>
                        <th style={styles.th}>Screen</th>
                        <th style={styles.th}>Priority</th>
                        <th style={styles.th}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tests.map(test => (
                        <tr key={test.id} style={styles.row}>
                            <td style={styles.td}>{test.title}</td>
                            <td style={styles.td}>{test.screen}</td>
                            <td style={styles.td}>
                                <span style={styles.priority(test.priority)}>{test.priority}</span>
                            </td>
                            <td style={styles.td}>
                                <span style={styles.status}>Ready</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 14,
    },
    th: {
        textAlign: 'left',
        padding: '10px 14px',
        borderBottom: '1px solid #333',
        color: '#888',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    row: {
        borderBottom: '1px solid #222',
    },
    td: {
        padding: '12px 14px',
    },
    priority: (p) => ({
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: p === 'High' ? '#7f1d1d' : p === 'Medium' ? '#78350f' : '#1e3a5f',
        color: '#fff',
    }),
    status: {
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: '#14532d',
        color: '#4ade80',
    },
};
