// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useTheme } from '../../contexts/ThemeContext';
import { Bars3Icon, XCircleIcon } from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive sidebar based on screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };
        
        // Set initial value
        handleResize();
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar when clicking outside on mobile
    const handleOverlayClick = (e) => {
        if (sidebarOpen && isMobile) {
            setSidebarOpen(false);
        }
    };

    return (
        <div className={`flex h-screen w-full ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            {/* Desktop Sidebar - always visible on desktop */}
            {!isMobile && (
                <div className="w-64 h-full">
                    <Sidebar />
                </div>
            )}
            
            {/* Mobile Sidebar - conditionally visible */}
            {isMobile && sidebarOpen && (
                <>
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-20"
                        onClick={handleOverlayClick}
                    ></div>
                    <div className="fixed top-0 left-0 h-full z-30 w-64">
                        <Sidebar />
                    </div>
                </>
            )}
            
            {/* Mobile menu toggle button */}
            {isMobile && (
                <button 
                    className={`fixed z-40 bottom-4 right-4 p-3 rounded-full shadow-lg ${isDarkMode ? 'bg-green-600 text-white' : 'bg-white text-green-700'} focus:outline-none focus:ring-2 focus:ring-green-500`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? 
                        <XCircleIcon className="h-6 w-6" /> : 
                        <Bars3Icon className="h-6 w-6" />
                    }
                </button>
            )}
            
            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;