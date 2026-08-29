export function terbilang(number, suffix = 'Rupiah') {
    const num = Math.floor(Math.abs(Number(number) || 0));

    if (num === 0) return `Nol ${suffix}`.trim();

    const units = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

    function convert(n) {
        if (n < 12) {
            return units[n];
        } else if (n < 20) {
            return convert(n - 10) + ' Belas';
        } else if (n < 100) {
            return convert(Math.floor(n / 10)) + ' Puluh ' + convert(n % 10);
        } else if (n < 200) {
            return 'Seratus ' + convert(n - 100);
        } else if (n < 1000) {
            return convert(Math.floor(n / 100)) + ' Ratus ' + convert(n % 100);
        } else if (n < 2000) {
            return 'Seribu ' + convert(n - 1000);
        } else if (n < 1000000) {
            return convert(Math.floor(n / 1000)) + ' Ribu ' + convert(n % 1000);
        } else if (n < 1000000000) {
            return convert(Math.floor(n / 1000000)) + ' Juta ' + convert(n % 1000000);
        } else if (n < 1000000000000) {
            return convert(Math.floor(n / 1000000000)) + ' Miliar ' + convert(n % 1000000000);
        } else if (n < 1000000000000000) {
            return convert(Math.floor(n / 1000000000000)) + ' Triliun ' + convert(n % 1000000000000);
        }
        return String(n);
    }

    const result = convert(num).replace(/\s+/g, ' ').trim();
    const prefix = Number(number) < 0 ? 'Minus ' : '';

    return `${prefix}${result} ${suffix}`.trim();
}
