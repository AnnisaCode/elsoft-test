import { apiRequest } from './api.js';
import { showToast, hideToast, navigateToPage } from './utils.js';

export async function handleLogin(e) {
    e.preventDefault();
    const loginBtn = document.getElementById('login-btn');
    const originalText = loginBtn.innerHTML;
    try {
        loginBtn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>';
        loginBtn.disabled = true;
        const formData = new FormData(e.target);
        const loginData = {
            UserName: formData.get('username'),
            Password: formData.get('password'),
            Company: "d3170153-6b16-4397-bf89-96533ee149ee",
            browserInfo: {
                chrome: true, chrome_view: false, chrome_mobile: false, chrome_mobile_ios: false,
                safari: false, safari_mobile: false, msedge: false, msie_mobile: false, msie: false
            },
            machineInfo: {
                brand: "Apple", model: "", os_name: "Mac", os_version: "10.15", type: "desktop"
            },
            osInfo: {
                android: false, blackberry: false, ios: false, windows: false, windows_phone: false,
                mac: true, linux: false, chrome: false, firefox: false, gamingConsole: false
            },
            osNameInfo: { name: "Mac", version: "10.15", platform: "" },
            Device: "web_" + Date.now(), Model: "Admin Web", Source: "103.242.150.163", Exp: 3
        };
        const response = await fetch('https://api-core.elsoft.id/portal/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        const result = await response.json();
        if (response.ok && (result.access_token || (result.data && result.data.token))) {
            let user = result.user || result.data?.user || { username: loginData.UserName, Oid: result.Oid };
            if (!user.Company && (user.CompanyOid || user.company_id)) {
                user.Company = user.CompanyOid || user.company_id;
            }
            localStorage.setItem('authToken', result.access_token || (result.data && result.data.token));
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('company', user.Company || 'd3170153-6b16-4397-bf89-96533ee149ee');
            showToast('Login berhasil!', 'success');
            showNavbar();
            navigateToPage('item');
        } else {
            throw new Error(result.message || result.error || 'Login gagal');
        }
    } catch (error) {
        showToast('Login gagal: ' + error.message, 'error');
    } finally {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
}

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    hideNavbar();
    navigateToPage('login');
    showToast('Logout berhasil', 'success');
}

export function showNavbar() {
    document.getElementById('navbar').classList.remove('hidden');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        document.getElementById('user-info').textContent = `Selamat Datang, ${currentUser.username}`;
    }
}

export function hideNavbar() {
    document.getElementById('navbar').classList.add('hidden');
} 