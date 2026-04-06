import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLocation } from './hooks/useLocation';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RequestDuaPage from './pages/RequestDuaPage';
import MakeDuaPage from './pages/MakeDuaPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const locationState = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--green-dark)', color: 'white'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌙</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700 }}>Pray4Me</div>
        <div style={{ marginTop: 16, opacity: 0.7 }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'request', label: 'Request Dua', icon: '➕' },
    { id: 'make', label: 'Make Dua', icon: '🤲' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      {activeTab === 'home' && <HomePage locationState={locationState} />}
      {activeTab === 'request' && <RequestDuaPage />}
      {activeTab === 'make' && <MakeDuaPage locationState={locationState} />}
      {activeTab === 'profile' && <ProfilePage />}

      <nav className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default App;
