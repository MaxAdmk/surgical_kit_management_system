const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
        throw new Error('Wrong email or password!');
    }
    
    return response.json();
};

export const getCsrfToken = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/csrf-token/`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();
    return data.csrfToken;
};

export const fetchWithAuth = async (url, options = {}) => {
    // Attempt to get CSRF token from cookie
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                      getCookie('csrftoken');
    
    return fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(csrfToken && { 'X-CSRFToken': csrfToken }),
            ...options.headers,
        },
    });
};

// Helper function to get cookie value by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}