import { apiRequest } from './api.js';
import { formatCurrency, showToast } from './utils.js';

// Variabel global terkait item
export let currentItems = [];
export let itemGroups = [];
export let itemAccountGroups = [];
export let itemUnits = [];
export let currentPage = 1;
export let lastPage = 1;
export let totalData = 0;
export const perPage = 20;
export let searchTerm = '';

export async function loadItems(page = 1, search = '') {
    currentPage = page;
    searchTerm = search;
    try {
        const tbody = document.getElementById('items-table-body');
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span class="ml-2">Memuat data...</span>
                    </div>
                </td>
            </tr>
        `;
        let url = `https://api-app.elsoft.id/admin/api/v1/item/list?page=${page}&per_page=${perPage}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        };
        const response = await fetch(url, { headers });
        const data = await response.json();
        if (Array.isArray(data.data)) {
            currentItems = data.data;
            currentPage = data.meta?.current_page || 1;
            lastPage = data.meta?.last_page || 1;
            totalData = data.meta?.total || data.CountTotalFooter || 0;
            renderItems(currentItems);
            renderPagination();
        } else {
            throw new Error(data.message || 'Failed to load items');
        }
    } catch (error) {
        showToast('Gagal memuat data item: ' + error.message, 'error');
        document.getElementById('items-table-body').innerHTML = `
            <tr>
                <td colspan="10" class="px-6 py-4 text-center text-gray-500">
                    Gagal memuat data. <button onclick="loadItems()" class="text-primary hover:underline">Coba lagi</button>
                </td>
            </tr>
        `;
    }
}

export function renderItems(items) {
    const tbody = document.getElementById('items-table-body');
    const thead = tbody.parentElement.querySelector('thead');
    if (thead) {
        thead.innerHTML = `
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimal Penjualan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Item</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perusahaan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sedang Aktif</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
        `;
    }
    if (!items || items.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada data item
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = items.map(item => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatSalesAmount(item.SalesAmountMinimum)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.Label || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.CompanyName || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.Weight || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.Remark || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.Code || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.ItemGroupName || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.IsActive === 'Y' || item.IsActive === true ? 'Y' : 'N'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(item.BalanceAmount || 0)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editItem('${item.Oid}')" class="text-primary hover:text-secondary mr-2">Edit</button>
                <button onclick="deleteItem('${item.Oid}')" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
        </tr>
    `).join('');
}

export function renderPagination() {
    const containerId = 'items-pagination';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'flex flex-col items-center mt-4 space-y-2';
        document.getElementById('item-page').appendChild(container);
    }
    container.innerHTML = `
        <div class="flex items-center space-x-2 mb-2">
            <button id="prevPageBtn" ${currentPage === 1 ? 'disabled' : ''} class="px-3 py-1 rounded bg-gray-200 text-gray-700 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}">Prev</button>
            <span>Halaman</span>
            <input type="number" min="1" max="${lastPage}" value="${currentPage}" id="pageInput" class="w-16 px-2 py-1 border rounded text-center" style="width: 50px;" />
            <span>dari ${lastPage}</span>
            <button id="nextPageBtn" ${currentPage === lastPage ? 'disabled' : ''} class="px-3 py-1 rounded bg-gray-200 text-gray-700 ${currentPage === lastPage ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}">Next</button>
        </div>
        <div class="flex items-center space-x-2 mb-2">
            <span>Total Data: ${totalData}</span>
        </div>
    `;
    setTimeout(() => {
        const pageInput = document.getElementById('pageInput');
        if (pageInput) {
            pageInput.addEventListener('change', function () {
                let val = parseInt(this.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > lastPage) val = lastPage;
                loadItems(val, searchTerm);
            });
        }
        const prevPageBtn = document.getElementById('prevPageBtn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', function () {
                if (currentPage > 1) loadItems(currentPage - 1, searchTerm);
            });
        }
        const nextPageBtn = document.getElementById('nextPageBtn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', function () {
                if (currentPage < lastPage) loadItems(currentPage + 1, searchTerm);
            });
        }
    }, 100);
}

export function filterItems() {
    const search = document.getElementById('item-search').value.toLowerCase();
    loadItems(1, search);
}

export async function showItemModal(item = null) {
    const modal = document.getElementById('item-modal');
    const title = document.getElementById('item-modal-title');
    document.getElementById('item-company').value = 'testcase'; // atau ambil dari currentUser
    document.getElementById('item-type').value = 'Product';
    if (item) {
        // EDIT MODE: mapping Oid jika perlu
        let groupOid = item.ItemGroup;
        let accGroupOid = item.ItemAccountGroup;
        let unitOid = item.ItemUnit;
        // Jika Oid kosong, mapping dari label
        if (!groupOid && item.ItemGroupName) {
            const found = itemGroups.find(g => g.Label === item.ItemGroupName);
            if (found) groupOid = found.Oid;
        }
        if (!accGroupOid && item.ItemAccountGroupName) {
            const found = itemAccountGroups.find(a => a.Label === item.ItemAccountGroupName);
            if (found) accGroupOid = found.Oid;
        }
        if (!unitOid && item.ItemUnitName) {
            const found = itemUnits.find(u => u.Label === item.ItemUnitName);
            if (found) unitOid = found.Oid;
        }
        renderItemModalFields(true, item.ItemGroupName, item.ItemAccountGroupName, item.ItemUnitName, groupOid, accGroupOid, unitOid);
        title.textContent = 'Edit Item';
        document.getElementById('item-oid').value = item.Oid;
        document.getElementById('item-code').value = item.Code || '<<Auto>>';
        document.getElementById('item-title').value = item.Label || '';
        document.getElementById('item-active').checked = item.IsActive === 'Y' || item.IsActive === true || item.IsActive === 'true';
    } else {
        // TAMBAH MODE: render select
        renderItemModalFields(false);
        title.textContent = 'Tambah Item';
        document.getElementById('item-form').reset();
        document.getElementById('item-oid').value = '';
        document.getElementById('item-code').value = '<<Auto>>';
        document.getElementById('item-title').value = '';
        document.getElementById('item-active').checked = true;
        // Load dropdown data
        await loadItemMasters();
    }
    modal.classList.remove('hidden');
}

export function hideItemModal() {
    document.getElementById('item-modal').classList.add('hidden');
}

export async function loadItemMasters() {
    // Ambil data master dari endpoint yang benar
    const token = localStorage.getItem('authToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    // Item Group
    const groupRes = await fetch('https://api-app.elsoft.id/admin/api/v1/data/itemgroup', { headers });
    itemGroups = await groupRes.json();
    // Item Account Group
    const accGroupRes = await fetch('https://api-app.elsoft.id/admin/api/v1/data/itemaccountgroup', { headers });
    itemAccountGroups = await accGroupRes.json();
    // Item Unit
    const unitRes = await fetch('https://api-app.elsoft.id/admin/api/v1/data/itemunit', { headers });
    itemUnits = await unitRes.json();
    populateItemDropdowns();
}

export function populateItemDropdowns() {
    // Untuk mode tambah (dropdown)
    const groupSelect = document.getElementById('item-group');
    if (groupSelect) {
        groupSelect.innerHTML = itemGroups.map(g => `<option value="${g.Oid}">${g.Name || g.Label}</option>`).join('');
    }
    const accGroupSelect = document.getElementById('item-account-group');
    if (accGroupSelect) {
        accGroupSelect.innerHTML = itemAccountGroups.map(g => `<option value="${g.Oid}">${g.Name || g.Label}</option>`).join('');
    }
    const unitSelect = document.getElementById('item-unit');
    if (unitSelect) {
        unitSelect.innerHTML = itemUnits.map(u => `<option value="${u.Oid}">${u.Name || u.Label}</option>`).join('');
    }
}

export async function handleItemSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const oid = document.getElementById('item-oid').value;
    const companyId = localStorage.getItem('company') || 'd3170153-6b16-4397-bf89-96533ee149ee';
    const itemTypeOid = '3adfb47a-eab4-4d44-bde9-efae1bec8543';
    // Ambil Oid dari select (tambah) atau hidden input (edit)
    const itemGroupOid = document.getElementById('item-group')?.value || document.getElementById('item-group-oid').value;
    const itemAccountGroupOid = document.getElementById('item-account-group')?.value || document.getElementById('item-account-group-oid').value;
    const itemUnitOid = document.getElementById('item-unit')?.value || document.getElementById('item-unit-oid').value;
    const itemData = {
        Company: companyId,
        ItemType: itemTypeOid,
        Code: formData.get('item-code'),
        Label: formData.get('item-title'),
        ItemGroup: itemGroupOid,
        ItemAccountGroup: itemAccountGroupOid,
        ItemUnit: itemUnitOid,
        IsActive: document.getElementById('item-active').checked ? 'true' : 'false'
    };
    try {
        let response;
        if (oid) {
            response = await apiRequest(`https://api-app.elsoft.id/admin/api/v1/item/save?Oid=${oid}`, {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
        } else {
            response = await apiRequest('https://api-app.elsoft.id/admin/api/v1/item', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
        }
        if (response && (response.success !== false || response.data)) {
            showToast(oid ? 'Item berhasil diperbarui' : 'Item berhasil ditambahkan', 'success');
            hideItemModal();
            loadItems();
        } else {
            throw new Error(response && response.message ? response.message : 'Failed to save item');
        }
    } catch (error) {
        showToast('Gagal menyimpan item: ' + error.message, 'error');
    }
}

export async function editItem(oid) {
    const item = currentItems.find(i => i.Oid === oid);
    if (item) {
        showItemModal(item);
    } else {
        showToast('Item tidak ditemukan', 'error');
    }
}

export async function deleteItem(oid) {
    if (!confirm('Yakin ingin menghapus item ini?')) {
        return;
    }
    try {
        const response = await apiRequest(`https://api-app.elsoft.id/admin/api/v1/data/item/${oid}`, {
            method: 'DELETE'
        });
        if (response.success) {
            showToast('Item berhasil dihapus', 'success');
            loadItems();
        } else {
            if (response && typeof response === 'object' && (response.message || response._status)) {
                showToast('Gagal menghapus item: ' + (response.message || JSON.stringify(response)), 'error');
            } else {
                showToast('Gagal menghapus item: ' + response, 'error');
            }
        }
    } catch (error) {
        if (error && typeof error === 'object' && (error.message || error._status)) {
            showToast('Gagal menghapus item: ' + (error.message || JSON.stringify(error)), 'error');
        } else {
            showToast('Gagal menghapus item: ' + error, 'error');
        }
    }
}

// Helper
function formatSalesAmount(val) {
    if (!val) return '0.00';
    let num = parseFloat(val.toString().replace(/,/g, '.'));
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
} 