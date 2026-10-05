import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem('cp_student');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('cp_token') || null);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Configure axios authorization header default
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Real-time socket initialization
  useEffect(() => {
    const newSocket = io(window.location.origin, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    if (user) {
      newSocket.emit('register', user._id);
    }

    newSocket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
    });

    return () => newSocket.close();
  }, [user]);

  // Fetch initial notifications
  useEffect(() => {
    if (token) {
      axios.get('/api/notifications')
        .then(res => setNotifications(res.data))
        .catch(() => {});
    }
  }, [token]);

  const loginWithCredentials = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    handleAuthSuccess(res.data);
    return res.data;
  };

  const loginDemo = async (role) => {
    const res = await axios.post('/api/auth/demo-login', { role });
    handleAuthSuccess(res.data);
    return res.data;
  };

  const registerStudent = async (formData) => {
    const res = await axios.post('/api/auth/register-student', formData);
    handleAuthSuccess(res.data);
    return res.data;
  };

  const handleAuthSuccess = (data) => {
    setToken(data.token);
    setUser(data.user);
    setStudent(data.student);
    localStorage.setItem('cp_token', data.token);
    localStorage.setItem('cp_user', JSON.stringify(data.user));
    if (data.student) {
      localStorage.setItem('cp_student', JSON.stringify(data.student));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStudent(null);
    setNotifications([]);
    localStorage.removeItem('cp_token');
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_student');
  };

  const updateStudentProfile = (updatedStudent) => {
    setStudent(updatedStudent);
    localStorage.setItem('cp_student', JSON.stringify(updatedStudent));
  };

  return (
    <AuthContext.Provider value={{
      user,
      student,
      token,
      socket,
      notifications,
      setNotifications,
      loginWithCredentials,
      loginDemo,
      registerStudent,
      logout,
      updateStudentProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
