import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useLocation } from './hooks/useLocation';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RequestDuaPage from './pages/RequestDuaPage';
import MakeDuaPage from './pages/MakeDuaPage';
import ProfilePage from './pages/ProfilePage';
import Pray4MeLogo from './components/Pray4MeLogo';

function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const locationState = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(150deg, var(--green-dark), var(--green-primary))',
        color: 'white',
      }}>
        <div className="pulse" style={{ marginBottom: 18 }}>
          <Pray4MeLogo size={80} />
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Pray4Me</div>
        <div style={{ opacity: 0.6, fontSize: '0.86rem' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const tabs = [
    { id: 'home',    label: 'Home',    icon: '🏠' },
    { id: 'request', label: 'Request', icon: '➕' },
    { id: 'make',    label: 'Make Dua', icon: '🤲' },
    { id: 'profile', label: 'Profile',  icon: '👤' },
  ];

  return (
    <>
      {activeTab === 'home'    && <HomePage locationState={locationState} />}
      {activeTab === 'request' && <RequestDuaPage />}
      {activeTab === 'make'    && <MakeDuaPage locationState={locationState} />}
      {activeTab === 'profile' && <ProfilePage />}

      <nav className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default App;
