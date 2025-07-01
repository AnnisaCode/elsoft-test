// Tambahkan di paling atas main.js
import { handleLogin, logout, showNavbar, hideNavbar } from './js/auth.js';
import { loadItems, renderItems, renderPagination, filterItems, showItemModal, hideItemModal, handleItemSubmit, editItem, deleteItem, loadItemMasters, populateItemDropdowns } from './js/item.js';
import { loadTransactions, renderTransactions, filterTransactions, showTransactionModal, hideTransactionModal, handleTransactionSubmit, editTransaction, deleteTransaction } from './js/transaction.js';
import { showToast, hideToast } from './js/utils.js';

// Global Variables
let currentUser = null;
let authToken = null;
let currentItems = [];
let currentTransactions = [];
let itemGroups = [];
let itemAccountGroups = [];
let itemUnits = [];

// State untuk pagination
let currentPage = 1;
let lastPage = 1;
let totalData = 0;
const perPage = 20; // Default, tidak bisa diubah user
let searchTerm = '';

// API Configuration
const API_CONFIG = {
    AUTH_BASE: 'https://api-core.elsoft.id/portal/api',
    APP_BASE: 'https://api-app.elsoft.id/admin/api/v1'
};

// Initialize App
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is already logged in
    authToken = localStorage.getItem('authToken');
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (authToken && currentUser) {
        showNavbar();
        navigateToPage('item');
    } else {
        navigateToPage('login');
    }

    // Setup event listeners
    setupEventListeners();

    // Handle initial route
    handleRouteChange();
});

// Event Listeners Setup
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Item form
    document.getElementById('item-form').addEventListener('submit', handleItemSubmit);

    // Transaction form
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);

    // Search functionality
    document.getElementById('item-search').addEventListener('input', filterItems);
    document.getElementById('transaction-search').addEventListener('input', filterTransactions);

    // Hash change for routing
    window.addEventListener('hashchange', handleRouteChange);

    // Navigation links
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('href').substring(1);
            navigateToPage(page);
        });
    });
}

// Routing Functions
function handleRouteChange() {
    const hash = window.location.hash.substring(1) || 'login';
    navigateToPage(hash);
}

function navigateToPage(page) {
    // Hide all pages
    document.querySelectorAll('#main-content > div').forEach(div => {
        div.classList.add('hidden');
    });

    // Update navigation active state
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
        link.classList.remove('border-primary', 'text-primary', 'bg-gray-100');
        link.classList.add('border-transparent', 'text-gray-500');
    });

    // Show requested page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.classList.remove('hidden');
        pageElement.classList.add('fade-in');

        // Activate navigation link
        const activeLink = document.querySelector(`[href="#${page}"]`);
        if (activeLink) {
            activeLink.classList.remove('border-transparent', 'text-gray-500');
            activeLink.classList.add('border-primary', 'text-primary');
            if (activeLink.classList.contains('nav-link-mobile')) {
                activeLink.classList.add('bg-gray-100');
            }
        }

        // Load data for specific pages
        if (page === 'item' && authToken) {
            loadItems();
        } else if (page === 'transaction' && authToken) {
            loadTransactions();
        }
    }

    // Update URL hash
    if (window.location.hash !== `#${page}`) {
        window.location.hash = page;
    }
}

// Device Detection Functions
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const browserInfo = {
        chrome: /Chrome/.test(userAgent) && !/Edg/.test(userAgent),
        chrome_view: /Chrome/.test(userAgent) && /wv/.test(userAgent),
        chrome_mobile: /Chrome/.test(userAgent) && /Mobile/.test(userAgent),
        chrome_mobile_ios: /CriOS/.test(userAgent),
        safari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
        safari_mobile: /Safari/.test(userAgent) && /Mobile/.test(userAgent),
        msedge: /Edg/.test(userAgent),
        msie_mobile: /IEMobile/.test(userAgent),
        msie: /MSIE|Trident/.test(userAgent)
    };
    return browserInfo;
}

function getOSInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    const osInfo = {
        android: /Android/.test(userAgent),
        blackberry: /BlackBerry|BB10/.test(userAgent),
        ios: /iPhone|iPad|iPod/.test(userAgent),
        windows: /Win/.test(platform),
        windows_phone: /Windows Phone/.test(userAgent),
        mac: /Mac/.test(platform),
        linux: /Linux/.test(platform) && !/Android/.test(userAgent),
        chrome: /Chrome/.test(userAgent),
        firefox: /Firefox/.test(userAgent),
        gamingConsole: /PlayStation|Xbox|Nintendo/.test(userAgent)
    };

    return osInfo;
}

function getOSNameInfo() {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    let name = 'Unknown';
    let version = '';
    let platformInfo = platform;

    if (/Win/.test(platform)) {
        name = 'Windows';
        const winMatch = userAgent.match(/Windows NT ([\d.]+)/);
        if (winMatch) {
            version = winMatch[1];
        }
    } else if (/Mac/.test(platform)) {
        name = 'Mac';
        const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
        if (macMatch) {
            version = macMatch[1].replace(/_/g, '.');
        }
    } else if (/Linux/.test(platform)) {
        name = 'Linux';
    } else if (/Android/.test(userAgent)) {
        name = 'Android';
        const androidMatch = userAgent.match(/Android ([\d.]+)/);
        if (androidMatch) {
            version = androidMatch[1];
        }
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        name = 'iOS';
        const iosMatch = userAgent.match(/OS ([\d_]+)/);
        if (iosMatch) {
            version = iosMatch[1].replace(/_/g, '.');
        }
    }

    return {
        name: name,
        version: version,
        platform: platformInfo
    };
}

function getMachineInfo() {
    const userAgent = navigator.userAgent;
    const osNameInfo = getOSNameInfo();

    let brand = '';
    let model = '';
    let type = 'desktop';

    // Detect mobile
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/.test(userAgent)) {
        type = 'mobile';
    } else if (/Tablet|iPad/.test(userAgent)) {
        type = 'tablet';
    }

    // Try to detect brand
    if (/iPhone|iPad|iPod/.test(userAgent)) {
        brand = 'Apple';
    } else if (/Mac/.test(navigator.platform)) {
        brand = 'Apple';
    } else if (/Android/.test(userAgent)) {
        const brandMatch = userAgent.match(/\(([^;]+);/);
        if (brandMatch) {
            brand = brandMatch[1].split(' ')[0];
        }
    }

    return {
        brand: brand,
        model: model,
        os_name: osNameInfo.name,
        os_version: osNameInfo.version,
        type: type
    };
}

function generateDeviceId() {
    return 'web_' + Date.now();
}

function getClientIP() {
    // This is a placeholder since we can't get real IP from client-side
    // In production, this should be handled by backend
    return '127.0.0.1';
}

// API Helper Functions
async function apiRequest(url, options = {}) {
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
            // No Content, return success langsung
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

// Close modals when clicking outside
window.onclick = function (event) {
    const itemModal = document.getElementById('item-modal');
    const transactionModal = document.getElementById('transaction-modal');

    if (event.target === itemModal) {
        hideItemModal();
    }
    if (event.target === transactionModal) {
        hideTransactionModal();
    }
};

window.logout = logout;
window.showItemModal = showItemModal;
window.editItem = editItem;
window.deleteItem = deleteItem;
window.hideItemModal = hideItemModal;
window.handleItemSubmit = handleItemSubmit;
window.loadItems = loadItems;

window.showTransactionModal = showTransactionModal;
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.hideTransactionModal = hideTransactionModal;
window.handleTransactionSubmit = handleTransactionSubmit;
window.loadTransactions = loadTransactions;
window.hideToast = hideToast; 