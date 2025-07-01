import { apiRequest } from './api.js';
import { formatCurrency, formatDate, formatDateShort, getStatusClass, showToast } from './utils.js';

// Variabel global terkait transaksi
export let currentTransactions = [];
export let currentTransactionPage = 1;
export let lastTransactionPage = 1;
export let totalTransactionData = 0;
export const perPageTransaction = 20;
export let searchTransactionTerm = '';
export let allTransactionsCache = null;
export let masterAccounts = [];

export async function loadTransactions(page = 1, search = '', forceReload = false) {
    currentTransactionPage = page;
    searchTransactionTerm = search;
    try {
        const tbody = document.getElementById('transactions-table-body');
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span class="ml-2">Memuat data...</span>
                    </div>
                </td>
            </tr>
        `;
        // Jika sudah pernah load dan tidak forceReload, pakai cache
        if (allTransactionsCache && !forceReload) {
            filterAndRenderTransactions();
            return;
        }
        // Ambil seluruh data dari semua page
        let allTransactions = [];
        let pageNum = 1;
        let lastPageNum = 1;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        };
        do {
            let url = `https://api-app.elsoft.id/admin/api/v1/stockissue/list?page=${pageNum}&per_page=100`;
            const response = await fetch(url, { headers });
            let data = await response.json();
            let transactions = [];
            if (Array.isArray(data.data)) {
                transactions = data.data;
                lastPageNum = data.meta?.last_page || 1;
                totalTransactionData = data.meta?.total || data.CountTotalFooter || 0;
            } else if (Array.isArray(data)) {
                transactions = data;
                lastPageNum = 1;
                totalTransactionData = data.length;
            } else if (data.list && Array.isArray(data.list)) {
                transactions = data.list;
                lastPageNum = data.meta?.last_page || 1;
                totalTransactionData = data.meta?.total || data.list.length;
            }
            allTransactions = allTransactions.concat(transactions);
            pageNum++;
        } while (pageNum <= lastPageNum);
        allTransactionsCache = allTransactions;
        filterAndRenderTransactions();
    } catch (error) {
        showToast('Gagal memuat data transaksi: ' + error.message, 'error');
        document.getElementById('transactions-table-body').innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    Gagal memuat data. <button onclick="loadTransactions()" class="text-primary hover:underline">Coba lagi</button>
                </td>
            </tr>
        `;
    }
}

function filterAndRenderTransactions() {
    let filtered = allTransactionsCache;
    if (searchTransactionTerm) {
        const term = searchTransactionTerm.toLowerCase();
        filtered = allTransactionsCache.filter(transaction =>
            (transaction.CompanyName && transaction.CompanyName.toLowerCase().includes(term)) ||
            (transaction.Code && transaction.Code.toLowerCase().includes(term)) ||
            (transaction.Note && transaction.Note.toLowerCase().includes(term)) ||
            (transaction.AccountName && transaction.AccountName.toLowerCase().includes(term))
        );
    }
    currentTransactions = filtered;
    lastTransactionPage = Math.ceil(currentTransactions.length / perPageTransaction);
    const startIdx = (currentTransactionPage - 1) * perPageTransaction;
    const endIdx = startIdx + perPageTransaction;
    renderTransactions(currentTransactions.slice(startIdx, endIdx));
    renderTransactionPagination();
}

export function renderTransactions(transactions) {
    const tbody = document.getElementById('transactions-table-body');
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada data transaksi
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = transactions.map((transaction, idx) => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-2 text-center">${transaction.RowCountNumber || idx + 1}</td>
            <td class="px-4 py-2">${transaction.CompanyName || '-'}</td>
            <td class="px-4 py-2">${transaction.Code || '-'}</td>
            <td class="px-4 py-2">${transaction.Note || '-'}</td>
            <td class="px-4 py-2 text-center">${formatDateShort(transaction.Date) || '-'}</td>
            <td class="px-4 py-2">${transaction.AccountName || '-'}</td>
            <td class="px-4 py-2 text-center">${transaction.StatusName || '-'}</td>
            <td class="px-4 py-2 text-center">
                <button onclick="editTransaction('${transaction.Oid}')" class="text-primary hover:text-secondary mr-2">Edit</button>
                <button onclick="deleteTransaction('${transaction.Oid}')" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
        </tr>
    `).join('');
}

export function renderTransactionPagination() {
    const containerId = 'transactions-pagination';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'flex flex-col items-center mt-4 space-y-2';
        document.getElementById('transaction-page').appendChild(container);
    }
    container.innerHTML = `
        <div class="flex items-center space-x-2 mb-2">
            <button id="prevTransactionPageBtn" ${currentTransactionPage === 1 ? 'disabled' : ''} class="px-3 py-1 rounded bg-gray-200 text-gray-700 ${currentTransactionPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}">Prev</button>
            <span>Halaman</span>
            <input type="number" min="1" max="${lastTransactionPage}" value="${currentTransactionPage}" id="transactionPageInput" class="w-16 px-2 py-1 border rounded text-center" style="width: 50px;" />
            <span>dari ${lastTransactionPage}</span>
            <button id="nextTransactionPageBtn" ${currentTransactionPage === lastTransactionPage ? 'disabled' : ''} class="px-3 py-1 rounded bg-gray-200 text-gray-700 ${currentTransactionPage === lastTransactionPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}">Next</button>
        </div>
        <div class="flex items-center space-x-2 mb-2">
            <span>Total Data: ${totalTransactionData}</span>
        </div>
    `;
    setTimeout(() => {
        const pageInput = document.getElementById('transactionPageInput');
        if (pageInput) {
            pageInput.addEventListener('change', function () {
                let val = parseInt(this.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > lastTransactionPage) val = lastTransactionPage;
                loadTransactions(val, searchTransactionTerm);
            });
        }
        const prevPageBtn = document.getElementById('prevTransactionPageBtn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function () {
                if (currentTransactionPage > 1) loadTransactions(currentTransactionPage - 1, searchTransactionTerm);
            });
        }
        const nextPageBtn = document.getElementById('nextTransactionPageBtn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function () {
                if (currentTransactionPage < lastTransactionPage) loadTransactions(currentTransactionPage + 1, searchTransactionTerm);
            });
        }
    }, 100);
}

export function filterTransactions() {
    searchTransactionTerm = document.getElementById('transaction-search').value.toLowerCase();
    currentTransactionPage = 1;
    filterAndRenderTransactions();
}

export async function loadMasterAccounts() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
        const res = await fetch('https://api-app.elsoft.id/admin/api/v1/master/account', { headers });
        const data = await res.json();
        masterAccounts = Array.isArray(data) ? data : (data.data || []);
        const select = document.getElementById('transaction-account');
        if (select) {
            // Filter hanya yang Name dan Oid tidak kosong/null
            let filtered = masterAccounts.filter(acc => acc.Name && acc.Oid);
            // Cari index akun dengan Oid khusus
            const specialOid = 'bc54db2f-4b44-4401-be7d-31c21effa9c1';
            const specialIdx = filtered.findIndex(acc => acc.Oid === specialOid);
            let result = [];
            if (specialIdx !== -1) {
                // Ambil 4 data pertama (tanpa specialOid), lalu tambahkan specialOid (jika belum masuk)
                result = filtered.filter(acc => acc.Oid !== specialOid).slice(0, 4);
                result.push(filtered[specialIdx]);
            } else {
                // Ambil 5 data pertama
                result = filtered.slice(0, 5);
            }
            select.innerHTML = '<option value="">Pilih Akun</option>' +
                result.map(acc => `<option value="${acc.Oid}">${acc.Name}</option>`).join('');
        }
    } catch (err) {
        showToast('Gagal memuat data akun', 'error');
    }
}

export function showTransactionModal(transaction = null) {
    loadMasterAccounts();
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('transaction-modal-title');
    if (transaction) {
        title.textContent = 'Edit Transaksi';
        document.getElementById('transaction-oid').value = transaction.Oid;
        document.getElementById('transaction-docno').value = transaction.docno || '';
        document.getElementById('transaction-date').value = transaction.date ? transaction.date.split('T')[0] : '';
        document.getElementById('transaction-customer').value = transaction.customer || '';
        document.getElementById('transaction-description').value = transaction.description || '';
        document.getElementById('transaction-company').value = transaction.CompanyName || '';
    } else {
        title.textContent = 'Tambah Transaksi';
        document.getElementById('transaction-form').reset();
        document.getElementById('transaction-oid').value = '';
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
        // Set default CompanyName dari localStorage
        let companyName = '';
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            companyName = user.CompanyName || user.company_name || user.username || '';
        } catch { }
        document.getElementById('transaction-company').value = companyName;
    }
    modal.classList.remove('hidden');
}

export function hideTransactionModal() {
    document.getElementById('transaction-modal').classList.add('hidden');
}

export async function handleTransactionSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const transactionData = {
        Company: document.getElementById('transaction-company').value,
        Code: document.getElementById('transaction-code').value,
        Date: formData.get('transaction-date') || document.getElementById('transaction-date').value,
        Account: document.getElementById('transaction-account').value,
        Note: document.getElementById('transaction-note').value
    };
    const oid = document.getElementById('transaction-oid').value;
    try {
        let response;
        if (oid) {
            response = await apiRequest(`https://api-app.elsoft.id/admin/api/v1/stockissue/${oid}`, {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
        } else {
            response = await apiRequest('https://api-app.elsoft.id/admin/api/v1/stockissue', {
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

export async function editTransaction(oid) {
    try {
        const response = await apiRequest(`https://api-app.elsoft.id/admin/api/v1/stockissue/${oid}`);
        if (response.success && response.data) {
            showTransactionModal(response.data);
        } else {
            const transaction = currentTransactions.find(t => t.Oid === oid);
            if (transaction) {
                showTransactionModal(transaction);
            } else {
                showToast('Transaksi tidak ditemukan', 'error');
            }
        }
    } catch (error) {
        const transaction = currentTransactions.find(t => t.Oid === oid);
        if (transaction) {
            showTransactionModal(transaction);
        } else {
            showToast('Transaksi tidak ditemukan', 'error');
        }
    }
}

export async function deleteTransaction(oid) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) {
        return;
    }
    try {
        const response = await apiRequest(`https://api-app.elsoft.id/admin/api/v1/stockissue/${oid}`, {
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