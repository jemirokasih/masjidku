<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Return available system modules & permissions matrix metadata
     */
    public function modules(): JsonResponse
    {
        $defaultActions = [
            ['key' => 'view', 'label' => 'Lihat', 'description' => 'Hanya melihat data'],
            ['key' => 'create', 'label' => 'Tambah', 'description' => 'Menambah data baru'],
            ['key' => 'edit', 'label' => 'Edit', 'description' => 'Mengubah data existing'],
            ['key' => 'delete', 'label' => 'Hapus', 'description' => 'Menghapus data'],
        ];

        $modules = [
            [
                'key' => 'clients',
                'title' => 'Klien & Contact PIC',
                'description' => 'Akses kelola direktori Klien, profil instansi, & kontak PIC perusahaan.',
                'category' => 'Operasional',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'invoices',
                'title' => 'Faktur & Invoice Tagihan',
                'description' => 'Akses menerbitkan, mengedit, membatalkan, & mengirim invoice tagihan.',
                'category' => 'Keuangan',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'quotes',
                'title' => 'Penawaran Harga (Quotation)',
                'description' => 'Akses membuat & mengelola dokumen penawaran harga ke calon klien.',
                'category' => 'Keuangan',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'payments',
                'title' => 'Pembayaran & Kwitansi Resmi',
                'description' => 'Akses mencatat transaksi penerimaan pembayaran & mengunduh kwitansi PDF.',
                'category' => 'Keuangan',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'products',
                'title' => 'Katalog Barang & Jasa',
                'description' => 'Akses mengelola katalog produk, jasa, tarif harga, & stok item.',
                'category' => 'Operasional',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'leads',
                'title' => 'Prospek Sales & Leads',
                'description' => 'Akses mengelola calon prospek leads & konversi otomatis menjadi Project.',
                'category' => 'Operasional',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'delivery_orders',
                'title' => 'Surat Jalan (Delivery Orders)',
                'description' => 'Akses membuat, mencetak surat jalan, & memantau pengiriman barang.',
                'category' => 'Operasional',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'tax_invoices',
                'title' => 'Faktur Pajak (e-Faktur)',
                'description' => 'Akses mencatat nomor seri faktur pajak & mengunggah lampiran PDF faktur.',
                'category' => 'Keuangan',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'projects',
                'title' => 'Manajemen Proyek & Tugas',
                'description' => 'Akses mengelola proyek kerja, milestone, daftar tugas, & progress bar.',
                'category' => 'Operasional',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'hr',
                'title' => 'SDM, Karyawan, & Presensi',
                'description' => 'Akses mengelola data karyawan, rekap presensi, approval cuti, & master HR.',
                'category' => 'SDM & HR',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'audit_logs',
                'title' => 'Audit Trail & Rekam Aktivitas',
                'description' => 'Akses memantau log keamanan, rekam jejak aktivitas, & audit forensik sistem.',
                'category' => 'Administrasi',
                'actions' => [
                    ['key' => 'view', 'label' => 'Lihat', 'description' => 'Melihat jejak log audit sistem'],
                    ['key' => 'delete', 'label' => 'Hapus', 'description' => 'Membersihkan arsip audit log lama'],
                ],
            ],
            [
                'key' => 'users',
                'title' => 'Manajemen Pengguna Sistem',
                'description' => 'Akses kelola akun login user, reset password, & penautan akun karyawan.',
                'category' => 'Administrasi',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'roles',
                'title' => 'Manajemen Role & Hak Akses',
                'description' => 'Akses membuat role dinamis & mengonfigurasi matriks kewenangan modul.',
                'category' => 'Administrasi',
                'actions' => $defaultActions,
            ],
            [
                'key' => 'settings',
                'title' => 'Pengaturan Perusahaan & Nota',
                'description' => 'Akses mengonfigurasi profil perusahaan, logo, nomor dokumen, & template nota.',
                'category' => 'Administrasi',
                'actions' => [
                    ['key' => 'view', 'label' => 'Lihat', 'description' => 'Melihat profil & pengaturan perusahaan'],
                    ['key' => 'edit', 'label' => 'Edit', 'description' => 'Mengubah konfigurasi perusahaan'],
                ],
            ],
        ];

        return response()->json([
            'status' => 'success',
            'data' => $modules,
        ]);
    }

    /**
     * List all dynamic roles with user counts
     */
    public function index(Request $request): JsonResponse
    {
        $roles = Role::withCount('users')->orderBy('id', 'asc')->get();

        $roles->transform(function ($role) {
            if (is_string($role->permissions)) {
                $role->permissions = json_decode($role->permissions, true) ?? [];
            } elseif (is_null($role->permissions)) {
                $role->permissions = [];
            }
            return $role;
        });

        return response()->json([
            'status' => 'success',
            'data' => $roles,
        ]);
    }

    /**
     * Create new dynamic role
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'name' => ['nullable', 'string', 'max:50', 'unique:mbs_roles,name'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
        ]);

        // Auto-generate slug name if omitted
        $roleName = !empty($validated['name'])
            ? Str::slug($validated['name'], '_')
            : Str::slug($validated['label'], '_');

        // Ensure unique slug
        $count = Role::where('name', $roleName)->count();
        if ($count > 0) {
            $roleName .= '_' . (Role::max('id') + 1);
        }

        $role = Role::create([
            'name' => $roleName,
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'permissions' => $validated['permissions'] ?? [],
            'is_system' => false,
        ]);

        if (is_string($role->permissions)) {
            $role->permissions = json_decode($role->permissions, true) ?? [];
        }

        \App\Helpers\AuditLogger::log(
            'CREATE',
            'ROLES',
            "Membuat peranan/role baru: {$role->label} ({$role->name}).",
            'Role',
            $role->id,
            null,
            $role->toArray()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Role dinamis baru berhasil dibuat!',
            'data' => $role,
        ], 201);
    }

    /**
     * Show single role detail
     */
    public function show(int $id): JsonResponse
    {
        $role = Role::withCount('users')->findOrFail($id);

        if (is_string($role->permissions)) {
            $role->permissions = json_decode($role->permissions, true) ?? [];
        } elseif (is_null($role->permissions)) {
            $role->permissions = [];
        }

        return response()->json([
            'status' => 'success',
            'data' => $role,
        ]);
    }

    /**
     * Update dynamic role
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'permissions' => ['nullable', 'array'],
        ]);

        $oldValues = $role->toArray();

        $role->update([
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'permissions' => $validated['permissions'] ?? [],
        ]);

        if (is_string($role->permissions)) {
            $role->permissions = json_decode($role->permissions, true) ?? [];
        }

        \App\Helpers\AuditLogger::log(
            'UPDATE',
            'ROLES',
            "Memperbarui konfigurasi hak akses peranan/role {$role->label}.",
            'Role',
            $role->id,
            $oldValues,
            $role->toArray()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Role berhasil diperbarui!',
            'data' => $role,
        ]);
    }

    /**
     * Delete role (system roles & roles assigned to active users cannot be deleted)
     */
    public function destroy(int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if ($role->is_system || in_array(strtolower($role->name), ['admin', 'administrator', 'superadmin'], true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role sistem utama tidak dapat dihapus.',
            ], 422);
        }

        $userCount = User::where('role', $role->name)->count();
        if ($userCount > 0) {
            return response()->json([
                'status' => 'error',
                'message' => "Role ini tidak dapat dihapus karena masih digunakan oleh {$userCount} pengguna.",
            ], 422);
        }

        $oldValues = $role->toArray();
        $label = $role->label;
        $role->delete();

        \App\Helpers\AuditLogger::log(
            'DELETE',
            'ROLES',
            "Menghapus role {$label}.",
            'Role',
            $id,
            $oldValues,
            null
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Role berhasil dihapus.',
        ]);
    }
}
