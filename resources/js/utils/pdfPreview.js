import api from '../api/axios';

/**
 * Open PDF preview securely in a new browser tab with Bearer token authentication.
 *
 * @param {string} url - API endpoint relative path (e.g. '/invoices/1/pdf' or '/quotes/1/pdf')
 * @param {function} [onError] - Optional custom error handler callback
 */
export const openPdfPreview = async (url, onError) => {
    try {
        const response = await api.get(url, {
            responseType: 'blob',
        });
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const win = window.open(fileURL, '_blank');
        if (!win) {
            // Fallback if popup blocker blocked window.open
            const link = document.createElement('a');
            link.href = fileURL;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        }
    } catch (err) {
        console.error('PDF Preview error:', err);
        const message = err.response?.data?.message || 'Gagal memuat preview dokumen PDF.';
        if (typeof onError === 'function') {
            onError(message);
        } else {
            alert(message);
        }
    }
};

