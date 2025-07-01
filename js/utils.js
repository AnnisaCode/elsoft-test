export function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

export function formatDate(dateString) {
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

export function getStatusClass(status) {
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

export function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toast-content');
    const toastIcon = document.getElementById('toast-icon');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
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
    toast.classList.remove('hidden');
    setTimeout(() => {
        hideToast();
    }, 5000);
}

export function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}

export function navigateToPage(page) {
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
        if (page === 'item' && localStorage.getItem('authToken')) {
            if (window.loadItems) window.loadItems();
        } else if (page === 'transaction' && localStorage.getItem('authToken')) {
            if (window.loadTransactions) window.loadTransactions();
        }
    }

    // Update URL hash
    if (window.location.hash !== `#${page}`) {
        window.location.hash = page;
    }
} 