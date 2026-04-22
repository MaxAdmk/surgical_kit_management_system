// src/components/Login.jsx
import React, { useState } from 'react';
import { loginUser } from '../api';
import { validateLoginForm } from '../utils/validation';
import '../styles/Auth.css';

const Login = ({ onSwitchToRegister }) => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setFieldErrors({});

        const validation = validateLoginForm(credentials);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        setIsLoading(true);

        try {
            await loginUser(credentials);
            setSuccess('✓ Successfully signed in! Redirecting...');
            setTimeout(() => {
                // TODO: Implement dashboard redirect
            }, 2000);
            
        } catch (err) {
            setError(err.message || 'Sign in error. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-side">
                <div className="auth-header">
                    <h2>Sign In</h2>
                    <p>Enter your credentials to sign in</p>
                </div>

                {error && <div className="error-message">⚠️ {error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                            type="email"
                            name="email"
                            placeholder="your.email@hospital.com"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        {fieldErrors.email && (
                            <span className="field-error">❌ {fieldErrors.email}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        {fieldErrors.password && (
                            <span className="field-error">❌ {fieldErrors.password}</span>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ Loading...' : '🔓 Sign In'}
                    </button>
                </form>

                <div className="form-footer">
                    <span>Don't have an account?</span>
                    <a onClick={onSwitchToRegister}>Register</a>
                </div>
            </div>

            <div className="auth-info-side">
                <div className="info-section">
                    <h3>🏥 SurgiKit</h3>
                    <p>Modern medical equipment management system for healthcare facilities.</p>
                </div>

                <div className="features-list">
                    <div className="feature-item">
                        <div className="feature-icon">✓</div>
                        <span>Secure Authentication</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">✓</div>
                        <span>Equipment Management</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">✓</div>
                        <span>Accounting & Analytics</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">✓</div>
                        <span>Multi-level Access</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;