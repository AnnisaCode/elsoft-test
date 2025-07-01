// Tambahkan di paling atas main.js
import { handleLogin, logout, showNavbar, hideNavbar } from './js/auth.js';
import { loadItems, renderItems, renderPagination, filterItems, showItemModal, hideItemModal, handleItemSubmit, editItem, deleteItem, loadItemMasters, populateItemDropdowns } from './js/item.js';

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

// Transactions Management
async function loadTransactions() {
    try {
        const tbody = document.getElementById('transactions-table-body');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span class="ml-2">Memuat data...</span>
                    </div>
                </td>
            </tr>
        `;

        const response = await apiRequest(`${API_CONFIG.APP_BASE}/stockissue/list`);

        if (response.success && response.data) {
            currentTransactions = response.data;
            renderTransactions(currentTransactions);
        } else {
            throw new Error(response.message || 'Failed to load transactions');
        }
    } catch (error) {
        showToast('Gagal memuat data transaksi: ' + error.message, 'error');
        document.getElementById('transactions-table-body').innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Gagal memuat data. <button onclick="loadTransactions()" class="text-primary hover:underline">Coba lagi</button>
                </td>
            </tr>
        `;
    }
}

function renderTransactions(transactions) {
    const tbody = document.getElementById('transactions-table-body');

    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada data transaksi
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = transactions.map(transaction => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.docno || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatDate(transaction.date)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${transaction.customer || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(transaction.total)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(transaction.status)}">
                    ${transaction.status || 'Draft'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editTransaction('${transaction.Oid}')" class="text-primary hover:text-secondary mr-2">Edit</button>
                <button onclick="deleteTransaction('${transaction.Oid}')" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function filterTransactions() {
    const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
    const filteredTransactions = currentTransactions.filter(transaction =>
        (transaction.docno && transaction.docno.toLowerCase().includes(searchTerm)) ||
        (transaction.customer && transaction.customer.toLowerCase().includes(searchTerm)) ||
        (transaction.status && transaction.status.toLowerCase().includes(searchTerm))
    );
    renderTransactions(filteredTransactions);
}

function showTransactionModal(transaction = null) {
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('transaction-modal-title');

    if (transaction) {
        title.textContent = 'Edit Transaksi';
        document.getElementById('transaction-oid').value = transaction.Oid;
        document.getElementById('transaction-docno').value = transaction.docno || '';
        document.getElementById('transaction-date').value = transaction.date ? transaction.date.split('T')[0] : '';
        document.getElementById('transaction-customer').value = transaction.customer || '';
        document.getElementById('transaction-description').value = transaction.description || '';
    } else {
        title.textContent = 'Tambah Transaksi';
        document.getElementById('transaction-form').reset();
        document.getElementById('transaction-oid').value = '';
        // Set default date to today
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.remove('hidden');
}

function hideTransactionModal() {
    document.getElementById('transaction-modal').classList.add('hidden');
}

async function handleTransactionSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const transactionData = {
        docno: formData.get('transaction-docno') || document.getElementById('transaction-docno').value,
        date: formData.get('transaction-date') || document.getElementById('transaction-date').value,
        customer: formData.get('transaction-customer') || document.getElementById('transaction-customer').value,
        description: formData.get('transaction-description') || document.getElementById('transaction-description').value
    };

    const oid = document.getElementById('transaction-oid').value;

    try {
        let response;
        if (oid) {
            // Edit existing transaction
            response = await apiRequest(`${API_CONFIG.APP_BASE}/stockissue/${oid}`, {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
        } else {
            // Create new transaction
            response = await apiRequest(`${API_CONFIG.APP_BASE}/stockissue`, {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
        }

        if (response.success) {
            showToast(oid ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan', 'success');
            hideTransactionModal();
            loadTransactions();
        } else {
            throw new Error(response.message || 'Failed to save transaction');
        }
    } catch (error) {
        showToast('Gagal menyimpan transaksi: ' + error.message, 'error');
    }
}

async function editTransaction(oid) {
    try {
        // Try to get transaction details first
        const response = await apiRequest(`${API_CONFIG.APP_BASE}/stockissue/${oid}`);
        if (response.success && response.data) {
            showTransactionModal(response.data);
        } else {
            // Fallback to current transactions list
            const transaction = currentTransactions.find(t => t.Oid === oid);
            if (transaction) {
                showTransactionModal(transaction);
            } else {
                showToast('Transaksi tidak ditemukan', 'error');
            }
        }
    } catch (error) {
        // Fallback to current transactions list
        const transaction = currentTransactions.find(t => t.Oid === oid);
        if (transaction) {
            showTransactionModal(transaction);
        } else {
            showToast('Transaksi tidak ditemukan', 'error');
        }
    }
}

async function deleteTransaction(oid) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) {
        return;
    }

    try {
        const response = await apiRequest(`${API_CONFIG.APP_BASE}/stockissue/${oid}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showToast('Transaksi berhasil dihapus', 'success');
            loadTransactions();
        } else {
            throw new Error(response.message || 'Failed to delete transaction');
        }
    } catch (error) {
        showToast('Gagal menghapus transaksi: ' + error.message, 'error');
    }
}

// Utility Functions
function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function getStatusClass(status) {
    switch (status?.toLowerCase()) {
        case 'completed':
        case 'complete':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
        case 'canceled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Toast Notification Functions
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toast-content');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');

    // Set message
    toastMessage.textContent = message;

    // Set icon and border color based on type
    let iconHtml = '';
    let borderClass = '';

    switch (type) {
        case 'success':
            iconHtml = '<svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';
            borderClass = 'border-green-400';
            break;
        case 'error':
            iconHtml = '<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';
            borderClass = 'border-red-400';
            break;
        case 'warning':
            iconHtml = '<svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';
            borderClass = 'border-yellow-400';
            break;
        default:
            iconHtml = '<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>';
            borderClass = 'border-blue-400';
    }

    toastIcon.innerHTML = iconHtml;
    toastContent.className = `bg-white shadow-lg rounded-lg p-4 max-w-sm border-l-4 ${borderClass}`;

    // Show toast
    toast.classList.remove('hidden');

    // Auto hide after 5 seconds
    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    document.getElementById('toast').classList.add('hidden');
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