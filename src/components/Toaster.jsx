// src/components/Toaster.jsx
/**
 * @fileoverview Notification system (Toaster).
 * Provides a configured Toaster component and a helper function to trigger toasts globally.
 */
import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Triggers a toast notification.
 * 
 * @param {string} message - The message to display.
 * @param {string} [type='success'] - The type of toast ('success', 'error', 'loading', or default).
 */
export const showToast = (message, type = 'success') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'loading':
      toast.loading(message);
      break;
    default:
      toast(message);
  }
};

/**
 * CustomToaster Component.
 * Renders the global container for toast notifications with app-specific styling.
 * 
 * @returns {JSX.Element}
 */
export const CustomToaster = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      style: {
        background: '#1e293b',
        color: '#e2e8f0',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '0.875rem',
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#1e293b',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: '#1e293b',
        },
      },
    }}
  />
);