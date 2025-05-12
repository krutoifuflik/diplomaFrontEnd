import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, Loader } from 'lucide-react';
import { authService } from '../../services/authService';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await authService.login({ email, password });
      onClose();
      // Force page refresh to update auth state
      window.location.reload();
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-dark-700 rounded-lg shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between bg-primary-500 text-white p-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Secure Login</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Log in to access advanced features and save your analysis history.
          </p>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border dark:border-dark-500 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-dark-800"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border dark:border-dark-500 rounded-md focus:ring-2 focus:ring-primary-500 dark:bg-dark-800"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
            
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>For demo purposes:</p>
              <p>Email: demo@example.com</p>
              <p>Password: password</p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};