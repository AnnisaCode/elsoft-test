import { apiRequest } from './api.js';
import { formatCurrency, formatDate, formatDateShort, getStatusClass, showToast } from './utils.js';

// Variabel global terkait transaksi
export let currentTransactions = [];
export let currentTransactionPage = 1;
export let lastTransactionPage = 1;
export let totalTransactionData = 0;
export const perPageTransaction = 20;
export let searchTransactionTerm = '';
export let masterAccounts = [];

// Master data untuk detail
let masterDetailItems = [];
let masterDetailUnits = [];

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
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        };
        let url = `https://api-app.elsoft.id/admin/api/v1/stockissue/list?page=${page}&per_page=${perPageTransaction}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const response = await fetch(url, { headers });
        let data = await response.json();
        let transactions = [];
        if (Array.isArray(data.data)) {
            transactions = data.data;
            lastTransactionPage = data.meta?.last_page || 1;
            totalTransactionData = data.meta?.total || data.CountTotalFooter || 0;
        } else if (Array.isArray(data)) {
            transactions = data;
            lastTransactionPage = 1;
            totalTransactionData = data.length;
        } else if (data.list && Array.isArray(data.list)) {
            transactions = data.list;
            lastTransactionPage = data.meta?.last_page || 1;
            totalTransactionData = data.meta?.total || data.list.length;
        }
        currentTransactions = transactions;
        renderTransactions(currentTransactions);
        renderTransactionPagination();
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
        <tr class="hover:bg-gray-50" data-oid="${transaction.Oid}">
            <td class="px-4 py-2 text-center">${transaction.RowCountNumber || idx + 1}</td>
            <td class="px-4 py-2">${transaction.CompanyName || '-'}</td>
            <td class="px-4 py-2">${transaction.Code || '-'}</td>
            <td class="px-4 py-2">${transaction.Note || '-'}</td>
            <td class="px-4 py-2 text-center">${formatDateShort(transaction.Date) || '-'}</td>
            <td class="px-4 py-2">${transaction.AccountName || '-'}</td>
            <td class="px-4 py-2 text-center">${transaction.StatusName || '-'}</td>
            <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editTransaction('${transaction.Oid}')" class="text-primary hover:text-secondary mr-2 font-medium">Edit</button>
                <button onclick="deleteTransaction('${transaction.Oid}')" class="text-red-600 hover:text-red-900 mr-2 font-medium">Hapus</button>
                <button class="btn-transaction-detail text-blue-600 hover:text-blue-900 font-medium" data-oid="${transaction.Oid}">Detail</button>
            </td>
        </tr>
    `).join('');
    // Tambahkan event listener double click pada baris
    setTimeout(() => {
        document.querySelectorAll('#transactions-table-body tr').forEach(tr => {
            tr.ondblclick = () => {
                const oid = tr.getAttribute('data-oid');
                if (oid) openTransactionDetailDrawer(oid);
            };
        });
        document.querySelectorAll('.btn-transaction-detail').forEach(btn => {
            btn.onclick = e => {
                e.stopPropagation();
                openTransactionDetailDrawer(btn.dataset.oid);
            };
        });
    }, 100);
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
    loadTransactions(1, searchTransactionTerm, true);
}

export async function loadMasterAccounts(selectedOid = '') {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
        const res = await fetch('https://api-app.elsoft.id/admin/api/v1/master/account', { headers });
        const data = await res.json();
        masterAccounts = Array.isArray(data) ? data : (data.data || []);
        const select = document.getElementById('transaction-account');
        if (select) {
            // Tampilkan hanya account dengan Oid tertentu
            const specialOid = 'bc54db2f-4b44-4401-be7d-31c21effa9c1';
            const filtered = masterAccounts.filter(acc => acc.Oid === specialOid);
            select.innerHTML = '<option value="">Pilih Akun</option>' +
                filtered.map(acc => `<option value="${acc.Oid}">${acc.Name}</option>`).join('');
            if (selectedOid) select.value = selectedOid;
        }
    } catch (err) {
        showToast('Gagal memuat data akun', 'error');
    }
}

export function showTransactionModal(transaction = null) {
    const modal = document.getElementById('transaction-modal');
    const title = document.getElementById('transaction-modal-title');
    if (transaction) {
        title.textContent = 'Edit Transaksi';
        document.getElementById('transaction-oid').value = transaction.Oid;
        document.getElementById('transaction-code').value = transaction.Code || '';
        document.getElementById('transaction-date').value = transaction.Date ? transaction.Date.split('T')[0] : '';
        document.getElementById('transaction-company').value = transaction.CompanyName || '';
        document.getElementById('transaction-note').value = transaction.Note || '';
        loadMasterAccounts(transaction.Account);
    } else {
        title.textContent = 'Tambah Transaksi';
        document.getElementById('transaction-form').reset();
        document.getElementById('transaction-oid').value = '';
        document.getElementById('transaction-date').value = new Date().toISOString().slice(0, 10);
        let companyName = '';
        try {
            const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
            companyName = user.CompanyName || user.company_name || user.username || '';
        } catch { }
        document.getElementById('transaction-company').value = companyName;
        document.getElementById('transaction-code').value = '<<AutoGenerate>>';
        document.getElementById('transaction-account').value = '';
        document.getElementById('transaction-note').value = '';
        loadMasterAccounts();
    }
    modal.classList.remove('hidden');
}

export function hideTransactionModal() {
    document.getElementById('transaction-modal').classList.add('hidden');
}

export async function handleTransactionSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Ambil data user dari localStorage
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const companyId = user.Company || user.company || user.CompanyOid || 'd3170153-6b16-4397-bf89-96533ee149ee';
    const companyName = user.CompanyName || user.company_name || user.username || '';
    const oid = document.getElementById('transaction-oid').value;
    let code = document.getElementById('transaction-code').value;
    if (oid && code === '<<AutoGenerate>>') {
        // Cari kode asli dari cache
        const old = currentTransactions ? currentTransactions.find(t => t.Oid === oid) : null;
        if (old && old.Code) code = old.Code;
    }
    const date = formData.get('transaction-date') || document.getElementById('transaction-date').value;
    const selectedAccountOid = document.getElementById('transaction-account').value;
    const note = document.getElementById('transaction-note').value;
    // Cari AccountName dari masterAccounts
    let accountName = '';
    if (selectedAccountOid) {
        const acc = masterAccounts.find(a => a.Oid === selectedAccountOid);
        if (acc) accountName = acc.Name;
    }
    // Tambahkan (CompanyName) di belakang AccountName jika ada
    if (accountName && companyName) {
        accountName = accountName + ' (' + companyName + ')';
    }
    // Validasi wajib isi
    if (!companyId || !companyName || !code || !date || !selectedAccountOid || !accountName) {
        showToast('Semua field wajib diisi dan valid!', 'error');
        return;
    }
    // Siapkan status dan statusName
    let status = '';
    let statusName = '';
    if (oid) {
        // Cari data transaksi lama dari cache
        const old = currentTransactions ? currentTransactions.find(t => t.Oid === oid) : null;
        if (old) {
            status = old.Status || '';
            statusName = old.StatusName || '';
        }
    }
    const transactionData = {
        Company: companyId,
        CompanyName: companyName,
        Code: code,
        Date: date,
        Account: selectedAccountOid,
        AccountName: accountName,
        Note: note
    };
    if (oid) {
        transactionData.Oid = oid;
        transactionData.Status = status;
        transactionData.StatusName = statusName;
    }
    try {
        let response;
        let newOrEditedTransaction = null;
        if (oid) {
            response = await apiRequest(`https://api-app.elsoft.id/admin/api/v1/stockissue/${oid}`, {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
            newOrEditedTransaction = response.data || response;
        } else {
            response = await apiRequest('https://api-app.elsoft.id/admin/api/v1/stockissue', {
                method: 'POST',
                body: JSON.stringify(transactionData)
            });
            newOrEditedTransaction = response.data || response;
        }
        if ((response && response.success) || response.Oid) {
            showToast(oid ? 'Transaksi berhasil diperbarui' : 'Transaksi berhasil ditambahkan', 'success');
            hideTransactionModal();
            if (oid) {
                currentTransactions = currentTransactions.map(t => t.Oid === oid ? newOrEditedTransaction : t);
            } else {
                currentTransactions.push(newOrEditedTransaction);
            }
            await loadTransactions(currentTransactionPage, searchTransactionTerm, true);
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
            currentTransactions = currentTransactions.filter(t => t.Oid !== oid);
            await loadTransactions(currentTransactionPage, searchTransactionTerm, true);
        } else {
            throw new Error(response.message || 'Failed to delete transaction');
        }
    } catch (error) {
        showToast('Gagal menghapus transaksi: ' + error.message, 'error');
    }
}

// Drawer logic
export async function openTransactionDetailDrawer(oid) {
    const drawer = document.getElementById('transaction-detail-drawer');
    // Reset content
    document.getElementById('detail-company').textContent = '';
    document.getElementById('detail-code').textContent = '';
    document.getElementById('detail-date').textContent = '';
    document.getElementById('detail-account').textContent = '';
    document.getElementById('detail-status').textContent = '';
    document.getElementById('detail-note').textContent = '';
    document.getElementById('transaction-detail-items-table').innerHTML = '<tr><td colspan="6" class="text-center text-gray-400">Loading...</td></tr>';
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.remove('translate-x-full'), 10);

    // Fetch master item/unit jika belum ada
    if (!masterDetailItems.length || !masterDetailUnits.length) {
        await loadMasterDetailItemsAndUnits();
    }

    // Fetch parent
    let parent = null;
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`https://api-app.elsoft.id/admin/api/v1/stockissue/${oid}?_t=${Date.now()}`, { headers: { 'Authorization': `Bearer ${token}` } });
        parent = await res.json();
    } catch { }
    if (parent) {
        document.getElementById('detail-company').textContent = parent.CompanyName || '-';
        document.getElementById('detail-code').textContent = parent.Code || '-';
        document.getElementById('detail-date').textContent = parent.Date ? parent.Date.split('T')[0] : '-';
        document.getElementById('detail-account').textContent = parent.AccountName || '-';
        document.getElementById('detail-status').textContent = parent.StatusName || '-';
        document.getElementById('detail-note').textContent = parent.Note || '-';
        // Render tabel detail dari parent.Details
        let items = Array.isArray(parent.Details) ? parent.Details : [];
        if (items.length > 0) {
            document.getElementById('transaction-detail-items-table').innerHTML = items.map((item, idx) => `
                <tr>
                    <td class="px-4 py-2 text-center">${idx + 1}</td>
                    <td class="px-4 py-2">${item.ItemName || '-'}</td>
                    <td class="px-4 py-2 text-center">${item.Quantity ? Number(item.Quantity).toString().replace(/\.0+$/, '') : '-'}</td>
                    <td class="px-4 py-2">${item.ItemUnitName || '-'}</td>
                    <td class="px-4 py-2 text-center whitespace-nowrap text-sm font-medium">
                        <button class="btn-detail-edit text-primary hover:text-secondary mr-2 font-medium" data-oid="${item.Oid}" data-parent="${oid}">Edit</button>
                        <button class="btn-detail-delete text-red-600 hover:text-red-900 font-medium" data-oid="${item.Oid}" data-parent="${oid}">Hapus</button>
                    </td>
                </tr>
            `).join('');
        } else {
            document.getElementById('transaction-detail-items-table').innerHTML = '<tr><td colspan="6" class="text-center text-gray-400">No data</td></tr>';
        }
        // Event listener Edit/Hapus
        setTimeout(() => {
            document.querySelectorAll('.btn-detail-edit').forEach(btn => {
                btn.onclick = () => {
                    const oid = btn.getAttribute('data-oid');
                    const parentOid = btn.getAttribute('data-parent');
                    const detail = (parent.Details || []).find(d => d.Oid === oid);
                    showDetailItemModal('edit', parentOid, detail);
                };
            });
            document.querySelectorAll('.btn-detail-delete').forEach(btn => {
                btn.onclick = async () => {
                    const oid = btn.getAttribute('data-oid');
                    const parentOid = btn.getAttribute('data-parent');
                    if (!confirm('Yakin ingin menghapus detail ini?')) return;
                    const token = localStorage.getItem('authToken');
                    await fetch(`https://api-app.elsoft.id/admin/api/v1/stockissue/detail/${oid}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    // Tutup drawer lalu buka ulang agar data pasti fresh
                    const drawer = document.getElementById('transaction-detail-drawer');
                    if (drawer) {
                        drawer.classList.add('translate-x-full');
                        setTimeout(() => {
                            drawer.classList.add('hidden');
                            openTransactionDetailDrawer(parentOid);
                        }, 350);
                    }
                };
            });
        }, 100);
    } else {
        document.getElementById('transaction-detail-items-table').innerHTML = '<tr><td colspan="6" class="text-center text-gray-400">No data</td></tr>';
    }
    renderDetailAddButton(oid);
}

// Tambah tombol Add di tab Details drawer
function renderDetailAddButton(parentOid) {
    const detailsTab = document.getElementById('transaction-detail-details');
    if (!detailsTab) return;
    let addBtn = document.getElementById('btn-add-detail-item');
    if (!addBtn) {
        addBtn = document.createElement('button');
        addBtn.id = 'btn-add-detail-item';
        addBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-2 float-right';
        addBtn.textContent = '+ Detail';
        detailsTab.insertBefore(addBtn, detailsTab.firstChild);
    }
    addBtn.onclick = () => showDetailItemModal('add', parentOid);
}

// Show modal add/edit detail
function showDetailItemModal(mode, parentOid, detail = null) {
    const modal = document.getElementById('transaction-detail-item-modal');
    const title = document.getElementById('transaction-detail-item-modal-title');
    const form = document.getElementById('transaction-detail-item-form');
    form.reset();
    document.getElementById('detail-item-oid').value = detail && detail.Oid ? detail.Oid : '';
    document.getElementById('detail-qty').value = detail && detail.Quantity ? parseInt(detail.Quantity, 10) : 1;
    // Dropdown dari master
    const itemSelect = document.getElementById('detail-item');
    itemSelect.innerHTML = masterDetailItems.map(i => `<option value="${i.Oid}">${i.Label || i.Name || '-'}</option>`).join('');
    itemSelect.value = detail && detail.Item ? detail.Item : '';
    const unitSelect = document.getElementById('detail-unit');
    unitSelect.innerHTML = masterDetailUnits.map(u => `<option value="${u.Oid}">${u.Name || u.Label}</option>`).join('');
    unitSelect.value = detail && detail.ItemUnit ? detail.ItemUnit : '';
    title.textContent = mode === 'add' ? 'Tambah Detail' : 'Edit Detail';
    modal.classList.remove('hidden');
    // Simpan parentOid di form dataset
    form.dataset.parentOid = parentOid;
    form.dataset.mode = mode;
}

// Close modal
function closeDetailItemModal() {
    document.getElementById('transaction-detail-item-modal').classList.add('hidden');
}

// Handle submit detail
async function handleDetailItemSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const parentOid = form.dataset.parentOid;
    const mode = form.dataset.mode;
    const item = document.getElementById('detail-item').value;
    const itemName = document.getElementById('detail-item').selectedOptions[0]?.text || '';
    const qty = document.getElementById('detail-qty').value;
    const unit = document.getElementById('detail-unit').value;
    const unitName = document.getElementById('detail-unit').selectedOptions[0]?.text || '';
    const oid = document.getElementById('detail-item-oid').value;
    if (!item || !qty || !unit) return alert('Semua field wajib diisi!');
    const token = localStorage.getItem('authToken');
    let url = `https://api-app.elsoft.id/admin/api/v1/stockissue/detail?StockIssue=${parentOid}`;
    if (mode === 'add') url += '&Oid=NONE';
    const body = {
        index: null,
        Item: item,
        ItemName: itemName,
        Quantity: qty.toString(),
        ItemUnit: unit,
        ItemUnitName: unitName,
        Description: null
    };
    if (mode === 'edit') body.Oid = oid;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        closeDetailItemModal();
        // Tutup drawer lalu buka ulang agar data pasti fresh
        const drawer = document.getElementById('transaction-detail-drawer');
        if (drawer) {
            drawer.classList.add('translate-x-full');
            setTimeout(() => {
                drawer.classList.add('hidden');
                openTransactionDetailDrawer(parentOid);
            }, 350);
        }
    } catch { }
}

// Event listener modal
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('transaction-detail-item-form');
        if (form) form.onsubmit = handleDetailItemSubmit;
        const cancelBtn = document.getElementById('detail-item-cancel');
        if (cancelBtn) cancelBtn.onclick = closeDetailItemModal;
        const closeBtn = document.getElementById('close-detail-item-modal');
        if (closeBtn) closeBtn.onclick = closeDetailItemModal;
    });
}

// Tab switching & close drawer
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const drawer = document.getElementById('transaction-detail-drawer');
        const closeBtn = document.getElementById('close-transaction-detail-drawer');
        const tabMain = document.getElementById('tab-main');
        const tabDetails = document.getElementById('tab-details');
        const mainContent = document.getElementById('transaction-detail-main');
        const detailsContent = document.getElementById('transaction-detail-details');
        if (closeBtn) closeBtn.onclick = () => { drawer.classList.add('translate-x-full'); setTimeout(() => drawer.classList.add('hidden'), 300); };
        if (tabMain && tabDetails && mainContent && detailsContent) {
            tabMain.onclick = () => {
                tabMain.classList.add('border-primary'); tabMain.classList.remove('text-gray-500');
                tabDetails.classList.remove('border-primary'); tabDetails.classList.add('text-gray-500');
                mainContent.classList.remove('hidden'); detailsContent.classList.add('hidden');
            };
            tabDetails.onclick = () => {
                tabDetails.classList.add('border-primary'); tabDetails.classList.remove('text-gray-500');
                tabMain.classList.remove('border-primary'); tabMain.classList.add('text-gray-500');
                detailsContent.classList.remove('hidden'); mainContent.classList.add('hidden');
            };
        }
        // Tambahkan event ke tombol Detail dan double click baris
        setTimeout(() => {
            document.querySelectorAll('.btn-transaction-detail').forEach(btn => {
                btn.onclick = e => { e.stopPropagation(); openTransactionDetailDrawer(btn.dataset.oid); };
            });
            document.querySelectorAll('#transactions-table-body tr').forEach(tr => {
                tr.ondblclick = () => {
                    const oid = tr.getAttribute('data-oid');
                    if (oid) openTransactionDetailDrawer(oid);
                };
            });
        }, 500);
    });
}

async function loadMasterDetailItemsAndUnits() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    // Item
    const itemRes = await fetch('https://api-app.elsoft.id/admin/api/v1/data/item', { headers });
    masterDetailItems = await itemRes.json();
    // Unit
    const unitRes = await fetch('https://api-app.elsoft.id/admin/api/v1/data/itemunit', { headers });
    masterDetailUnits = await unitRes.json();
} 