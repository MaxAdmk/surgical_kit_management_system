// src/components/Register.jsx
import React, { useState } from 'react';
import { registerUser } from '../api';
import { validateRegistrationForm, getPasswordStrengthLabel } from '../utils/validation';
import '../styles/Auth.css';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        role: 'nurse',
        hospital_id: 1
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }

        if (name === 'password') {
            let strength = 0;
            if (value.length >= 8) strength++;
            if (/[a-z]/.test(value) && /[A-Z]/.test(value)) strength++;
            if (/[0-9]/.test(value)) strength++;
            if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]/.test(value)) strength++;
            setPasswordStrength(strength);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setFieldErrors({});

        const validation = validateRegistrationForm(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        setIsLoading(true);

        try {
            await registerUser(formData);
            setMessage('✓ Registration successful! You can now sign in.');
            
            setFormData({
                email: '',
                name: '',
                password: '',
                role: 'nurse',
                hospital_id: 1
            });
            setPasswordStrength(0);

            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (error) {
            setError('❌ Registration error. Please check your data and try again.');
            console.error("Registration error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form-side">
                <div className="auth-header">
                    <h2>Staff Registration</h2>
                    <p>Create a new account to access the system</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            className={`form-input ${fieldErrors.name ? 'error' : ''}`}
                            type="text"
                            name="name"
                            placeholder="John Doe Smith"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        {fieldErrors.name && (
                            <span className="field-error">❌ {fieldErrors.name}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className={`form-input ${fieldErrors.email ? 'error' : ''}`}
                            type="email"
                            name="email"
                            placeholder="your.email@hospital.com"
                            value={formData.email}
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
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                        {fieldErrors.password && (
                            <span className="field-error">❌ {fieldErrors.password}</span>
                        )}
                        {formData.password && !fieldErrors.password && (
                            <div className="password-strength">
                                <div className={`strength-bar ${passwordStrength >= 1 ? 'weak' : ''}`}></div>
                                <div className={`strength-bar ${passwordStrength >= 2 ? 'medium' : ''}`}></div>
                                <div className={`strength-bar ${passwordStrength >= 4 ? 'strong' : ''}`}></div>
                            </div>
                        )}
                    </div>

                    <div className="form-group-half">
                        <div className="form-group">
                            <label className="form-label">Position</label>
                            <select
                                className="form-select"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={isLoading}
                            >
                                <option value="nurse">👩‍⚕️ Nurse</option>
                                <option value="doctor">👨‍⚕️ Doctor</option>
                                <option value="admin">👤 Administrator</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Hospital ID</label>
                            <input
                                className="form-input"
                                type="number"
                                name="hospital_id"
                                placeholder="1"
                                value={formData.hospital_id}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? '⏳ Loading...' : '✏️ Register'}
                    </button>
                </form>

                <div className="form-footer">
                    <span>Already have an account?</span>
                    <a onClick={onSwitchToLogin}>Sign In</a>
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
                        <span>Secure Registration</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">✓</div>
                        <span>Extended Validation</span>
                    </div>
                    <div className="feature-item">
                        <div className="feature-icon">✓</div>
                        <span>Password Verification</span>
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

export default Register;