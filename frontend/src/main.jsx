// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />          {/* homepage */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* altre rotte della tua SPA */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
