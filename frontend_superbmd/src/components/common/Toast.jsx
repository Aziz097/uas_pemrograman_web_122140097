// src/components/common/Toast.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const ToastContext = React.createContext();

const Toast = ({ message, type, id, removeToast }) => {
    const [isVisible, setIsVisible] = useState(true);

    const icons = {
        success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        error: <XCircleIcon className="h-6 w-6 text-red-500" />,
        info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
        warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
    };

    const typeClasses = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => removeToast(id), 300); // Allow fade out animation
        }, 5000); // Auto-hide after 5 seconds

        return () => clearTimeout(timer);
    }, [id, removeToast]);

    return (
        <div
            className={`flex items-center p-4 rounded-lg shadow-lg mb-3 transition-all duration-300 ease-in-out transform ${typeClasses[type]} border-l-4 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
        >
            <div className="flex-shrink-0 mr-3">
                {icons[type]}
            </div>
            <div className="text-sm font-medium flex-grow">
                {message}
            </div>
            <button
                onClick={() => { setIsVisible(false); setTimeout(() => removeToast(id), 300); }}
                className="ml-auto text-gray-500 hover:text-gray-700 focus:outline-none"
            >
                <XCircleIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

let toastCounter = 0;
const toasts = new Set();
let forceUpdate = () => {}; // Fungsi untuk memicu re-render ToastProvider

export const ToastProvider = ({ children }) => {
    const [currentToasts, setCurrentToasts] = useState([]);
    const toastContainerRef = useRef(null);

    useEffect(() => {
        forceUpdate = () => {
            setCurrentToasts(Array.from(toasts));
        };
        // Ensure container is created if not already
        if (!toastContainerRef.current) {
            toastContainerRef.current = document.createElement('div');
            toastContainerRef.current.className = 'fixed top-4 right-4 z-[100]';
            document.body.appendChild(toastContainerRef.current);
        }
    }, []);

    const addToast = (message, type = 'info') => {
        const id = toastCounter++;
        const newToast = { id, message, type };
        toasts.add(newToast);
        forceUpdate(); // Memaksa re-render komponen ToastProvider
    };

    const removeToast = (id) => {
        const toastToRemove = Array.from(toasts).find(t => t.id === id);
        if (toastToRemove) {
            toasts.delete(toastToRemove);
            forceUpdate();
        }
    };

    // Render toasts into the portal container
    return (
        <ToastContext.Provider value={addToast}>
            {children}
            {toastContainerRef.current && ReactDOM.createPortal(
                <div className="fixed top-4 right-4 z-[100] flex flex-col items-end space-y-2">
                    {currentToasts.map((toast) => (
                        <Toast key={toast.id} {...toast} removeToast={removeToast} />
                    ))}
                </div>,
                toastContainerRef.current
            )}
        </ToastContext.Provider>
    );
};

export const showToast = (message, type) => {
    // This assumes ToastProvider has been rendered higher up in the component tree.
    // We are directly interacting with the 'toasts' Set and triggering an update.
    // A more robust solution might involve a custom hook that returns a function
    // which uses useContext(ToastContext) to get the addToast function.
    // For simplicity with direct import usage, this approach is used.
    const id = toastCounter++;
    toasts.add({ id, message, type });
    if (forceUpdate) {
        forceUpdate();
    }
};

// Pastikan ToastProvider melingkupi App di index.js
// <ToastProvider>
//   <App />
// </ToastProvider>