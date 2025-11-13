import { useState } from 'react';
import { authLogin, authSignup } from '../../api/client.js';
import './Auth.css';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const email = formData.email.trim();
      if (isLogin) {
        const r = await authLogin(email, formData.password)
        const { token, user } = r.data
        localStorage.setItem('authToken', token)
        try { if (window.chrome && chrome.storage && chrome.storage.sync) chrome.storage.sync.set({ pettalkToken: token }) } catch {}
        localStorage.setItem('user', JSON.stringify({ email: user.email }))
        setIsLoading(false)
        onAuthSuccess({ email: user.email, isNew: false })
      } else {
        const r = await authSignup(email, formData.password, email.split('@')[0])
        const { token, user } = r.data
        localStorage.setItem('authToken', token)
        try { if (window.chrome && chrome.storage && chrome.storage.sync) chrome.storage.sync.set({ pettalkToken: token }) } catch {}
        localStorage.setItem('user', JSON.stringify({ email: user.email }))
        setIsLoading(false)
        onAuthSuccess({ email: user.email, isNew: true })
      }
    } catch (err) {
      try {
        const email = formData.email.trim();
        const passKey = `auth:${email}`;
        if (isLogin) {
          const stored = localStorage.getItem(passKey);
          if (!stored) throw new Error('Account not found')
          const { password: savedPassword } = JSON.parse(stored);
          if (savedPassword !== formData.password) throw new Error('Incorrect password')
          localStorage.setItem('user', JSON.stringify({ email }));
          setIsLoading(false);
          onAuthSuccess({ email, isNew: false });
        } else {
          const exists = localStorage.getItem(passKey);
          if (exists) throw new Error('Account already exists')
          localStorage.setItem(passKey, JSON.stringify({ password: formData.password }));
          localStorage.setItem('user', JSON.stringify({ email }));
          setIsLoading(false);
          onAuthSuccess({ email, isNew: true });
        }
      } catch (e) {
        setErrors({ api: 'Authentication failed' });
        setIsLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="floating-pet floating-pet-1">🐱</div>
        <div className="floating-pet floating-pet-2">🐶</div>
        <div className="floating-pet floating-pet-3">🐰</div>
      </div>
      
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            {isLogin ? 'Welcome Back!' : 'Join PetTalk!'}
          </h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to continue caring for your virtual pets' 
              : 'Create an account to start your pet journey'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={toggleMode}
              className="auth-toggle"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;