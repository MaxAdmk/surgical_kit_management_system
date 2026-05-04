/**
 * Validation utilities for form inputs
 * Centralized validation functions to avoid code repetition
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        return { isValid: false, error: 'Email address is required' };
    }
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true, error: '' };
};

/**
 * Validate name - no numbers, minimum length
 * @param {string} name - Name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateName = (name) => {
    if (!name) {
        return { isValid: false, error: 'Name is required' };
    }
    if (name.trim().length < 3) {
        return { isValid: false, error: 'Name must contain at least 3 characters' };
    }
    if (/\d/.test(name)) {
        return { isValid: false, error: 'Name cannot contain numbers' };
    }
    if (!/^[a-zA-Zа-яА-ЯіїєґІЇЄҐ\s'-]+$/.test(name)) {
        return { isValid: false, error: 'Name can only contain letters, spaces, hyphens and apostrophes' };
    }
    return { isValid: true, error: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, error: string, strength: number (0-4) }
 */
export const validatePassword = (password) => {
    let strength = 0;
    const errors = [];

    if (!password) {
        return { isValid: false, error: 'Password is required', strength: 0 };
    }

    if (password.length < 8) {
        errors.push('minimum 8 characters');
    } else {
        strength++;
    }

    if (!/[a-z]/.test(password)) {
        errors.push('lowercase letters (a-z)');
    } else {
        strength++;
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('uppercase letters (A-Z)');
    } else {
        strength++;
    }

    if (!/[0-9]/.test(password)) {
        errors.push('numbers (0-9)');
    } else {
        strength++;
    }

    if (!/[!@#$%^&*()_+=\[\]{};':"\\|,.<>?]/.test(password)) {
        errors.push('special characters (!@#$%^&*)');
    }

    if (errors.length > 0) {
        return {
            isValid: false,
            error: `Password must contain: ${errors.join(', ')}`,
            strength
        };
    }

    return { isValid: true, error: '', strength };
};

/**
 * Get password strength label (for UI display)
 * @param {number} strength - Strength level (0-4)
 * @returns {string} - Strength label
 */
export const getPasswordStrengthLabel = (strength) => {
    if (strength === 0) return '';
    if (strength <= 1) return 'weak';
    if (strength <= 2) return 'medium';
    return 'strong';
};

/**
 * Validate login form
 * @param {object} credentials - { email, password }
 * @returns {object} - { isValid: boolean, errors: { email?: string, password?: string } }
 */
export const validateLoginForm = (credentials) => {
    const errors = {};

    const emailValidation = validateEmail(credentials.email);
    if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
    }

    if (!credentials.password) {
        errors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
        errors.password = 'Password must contain at least 6 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate registration form
 * @param {object} formData - { email, name, password }
 * @returns {object} - { isValid: boolean, errors: { email?: string, name?: string, password?: string } }
 */
export const validateRegistrationForm = (formData) => {
    const errors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
        errors.email = emailValidation.error;
    }

    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
        errors.name = nameValidation.error;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        passwordStrength: passwordValidation.strength || 0
    };
};
