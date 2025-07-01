export async function apiRequest(url, options = {}) {
    const authToken = localStorage.getItem('authToken');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    try {
        const response = await fetch(url, mergedOptions);
        if (response.status === 204) {
            return { success: true, _status: 204, _ok: true };
        }
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = { message: 'Invalid JSON response', parseError: e.message };
        }
        data._status = response.status;
        data._ok = response.ok;
        return data;
    } catch (error) {
        return { message: error.message, _status: 0, _ok: false };
    }
} 