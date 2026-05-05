import { useState } from 'react';
import Scanner from './components/Scanner';
import Dashboard from './components/Dashboard';

export default function App() {
    const [view, setView] = useState('generator');
    const [savedTests, setSavedTests] = useState([]);

    function handleTestAdded(test) {
        setSavedTests(prev => [...prev, test]);
    }

    return (
        <div style={styles.root}>
            <nav style={styles.nav}>
                <span style={styles.logo}>Revyl Tester</span>
                <div style={styles.tabs}>
                    <button onClick={() => setView('generator')} style={styles.tab(view === 'generator')}>Generator</button>
                    <button onClick={() => setView('dashboard')} style={styles.tab(view === 'dashboard')}>
                        Dashboard {savedTests.length > 0 && `(${savedTests.length})`}
                    </button>
                </div>
            </nav>

            <main style={styles.main}>
                <div style={{ display: view === 'generator' ? 'block' : 'none' }}>
                    <Scanner onTestAdded={handleTestAdded} />
                </div>
                <div style={{ display: view === 'dashboard' ? 'block' : 'none' }}>
                    <Dashboard tests={savedTests} />
                </div>
            </main>
        </div>
    );
}

const styles = {
    root: {
        minHeight: '100vh',
        backgroundColor: '#111',
        color: '#f0f0f0',
        fontFamily: 'system-ui, sans-serif',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid #333',
        backgroundColor: '#0a0a0a',
    },
    logo: {
        fontWeight: 700,
        fontSize: 18,
    },
    tabs: {
        display: 'flex',
        gap: 8,
    },
    tab: (active) => ({
        padding: '6px 16px',
        backgroundColor: active ? '#2563eb' : 'transparent',
        color: active ? '#fff' : '#888',
        border: '1px solid ' + (active ? '#2563eb' : '#333'),
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: 14,
    }),
    main: {
        maxWidth: 800,
        margin: '0 auto',
        padding: '32px 24px',
    },
};
