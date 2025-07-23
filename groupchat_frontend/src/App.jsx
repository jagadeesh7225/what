import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { authAPI, apiUtils } from './api';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import GroupChat from './components/GroupChat';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AuthDebug from './components/AuthDebug';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStep, setAuthStep] = useState('login');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const checkAuthStatus = async () => {
    try {
      const isAuth = apiUtils.isAuthenticated();
      if (!isAuth) {
        setLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      const userData = {
        ...response.data.user,
        isGroupMember: response.data.user.isGroupMember || false
      };

      setUser(userData);
    } catch (error) {
      apiUtils.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {} 
    finally {
      apiUtils.clearAuth();
      setUser(null);
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
        <div style={{ marginTop: '20px', textAlign: 'center', maxWidth: '400px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>🔗 Connecting to backend...</p>
          <p style={{ fontSize: '12px', color: '#888' }}>
            Backend: https://what-2g03.onrender.com/
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          Clear Token & Reload
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <div className="navbar">
          <span className="navbar-title">Group Chat</span>
          <button className="dark-toggle-btn" onClick={toggleDarkMode}>
            {darkMode ? '☀ Light' : '🌙 Dark'}
          </button>
        </div>

        <AuthDebug user={user} loading={loading} />

        <Routes>
          <Route path="/login" element={!user ? (
              <Login onLogin={setUser} authStep={authStep} setAuthStep={setAuthStep} />
            ) : (
              <Navigate to="/dashboard" replace />
            )} 
          />
          <Route path="/register" element={!user ? (
              <Register onRegister={setUser} authStep={authStep} setAuthStep={setAuthStep} />
            ) : (
              <Navigate to="/dashboard" replace />
            )} 
          />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
          <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={user ? (
              <Dashboard user={user} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )} 
          />
          <Route path="/group-chat" element={
              !user ? <Navigate to="/login" replace />
              : !user.isGroupMember ? <Navigate to="/dashboard" replace />
              : <GroupChat user={user} onLogout={handleLogout} />
            } 
          />
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
