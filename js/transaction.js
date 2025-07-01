import { apiRequest } from './api.js';
import { formatCurrency, formatDate, formatDateShort, getStatusClass, showToast } from './utils.js';

// Variabel global terkait transaksi
export let currentTransactions = [];

export async function loadTransactions() {
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
        const response = await apiRequest('https://api-app.elsoft.id/admin/api/v1/stockissue/list');
        console.log('API stockissue/list response:', response);

        let transactions = [];
        if (Array.isArray(response)) {
            transactions = response;
        } else if (response.data && Array.isArray(response.data)) {
            transactions = response.data;
        } else if (response.list && Array.isArray(response.list)) {
            transactions = response.list;
        }

        if (transactions.length > 0) {
            currentTransactions = transactions;
            renderTransactions(currentTransactions);
        } else {
            throw new Error(response.message || 'Tidak ada data transaksi atau struktur response tidak sesuai.');
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
            <td class="px-4 py-2 text-center">${transaction.Date || '-'}</td>
            <td class="px-4 py-2">${transaction.AccountName || '-'}</td>
            <td class="px-4 py-2 text-center">${transaction.StatusName || '-'}</td>
            <td class="px-4 py-2 text-center">
                <button onclick="editTransaction('${transaction.Oid}')" class="text-primary hover:text-secondary mr-2">Edit</button>
                <button onclick="deleteTransaction('${transaction.Oid}')" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
        </tr>
    `).join('');
}

export function filterTransactions() {
    const searchTerm = document.getElementById('transaction-search').value.toLowerCase();
    const filteredTransactions = currentTransactions.filter(transaction =>
        (transaction.docno && transaction.docno.toLowerCase().includes(searchTerm)) ||
        (transaction.customer && transaction.customer.toLowerCase().includes(searchTerm)) ||
        (transaction.status && transaction.status.toLowerCase().includes(searchTerm))
    );
    renderTransactions(filteredTransactions);
}

export function showTransactionModal(transaction = null) {
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
        document.getElementById('transaction-date').value = new Date().toISOString().split('T')[0];
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
        docno: formData.get('transaction-docno') || document.getElementById('transaction-docno').value,
        date: formData.get('transaction-date') || document.getElementById('transaction-date').value,
        customer: formData.get('transaction-customer') || document.getElementById('transaction-customer').value,
        description: formData.get('transaction-description') || document.getElementById('transaction-description').value
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