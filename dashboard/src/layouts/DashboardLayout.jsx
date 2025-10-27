// src/layouts/DashboardLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTheme } from '../hooks/useTheme.jsx';

export default function DashboardLayout() {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex ${
      isDark ? 'bg-brand-gray-dark' : 'bg-brand-gray-light'
    }`}>
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto"
        >
          <div className="container-dashboard py-6">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
}