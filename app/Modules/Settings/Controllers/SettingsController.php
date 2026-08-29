<?php

namespace App\Modules\Settings\Controllers;

use App\Helpers\AuditLogger;
use App\Http\Controllers\Controller;
use App\Modules\Settings\Models\CompanySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Get current company settings
     */
    public function show(): JsonResponse
    {
        $settings = CompanySetting::instance();

        return response()->json([
            'status' => 'success',
            'data' => $settings,
        ]);
    }

    /**
     * Update company settings (Profile, Signature & SMTP)
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'company_email' => ['required', 'email', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_address' => ['nullable', 'string'],
            'timezone' => ['nullable', 'string', 'max:100'],
            'tax_number' => ['nullable', 'string', 'max:100'],
            'currency_code' => ['nullable', 'string', 'max:10'],
            'currency_symbol' => ['nullable', 'string', 'max:10'],

            // SMTP Settings
            'mail_mailer' => ['nullable', 'string', 'max:50'],
            'mail_host' => ['nullable', 'string', 'max:255'],
            'mail_port' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'mail_username' => ['nullable', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string', 'max:255'],
            'mail_encryption' => ['nullable', 'string', 'max:50'],
            'mail_from_address' => ['nullable', 'email', 'max:255'],
            'mail_from_name' => ['nullable', 'string', 'max:255'],
        ]);

        $settings = CompanySetting::instance();
        
        // Retain password if empty is submitted
        if (array_key_exists('mail_password', $validated) && empty($validated['mail_password'])) {
            unset($validated['mail_password']);
        }

        $oldValues = $settings->toArray();
        $settings->update($validated);

        AuditLogger::log(
            'UPDATE',
            'SETTINGS',
            'Memperbarui konfigurasi identitas perusahaan dan pengaturan sistem.',
            'CompanySetting',
            $settings->id,
            $oldValues,
            $settings->toArray()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pengaturan sistem berhasil diperbarui.',
            'data' => $settings,
        ]);
    }

    /**
     * Test SMTP Email Connection
     */
    public function testSmtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'recipient_email' => ['required', 'email'],
        ]);

        $settings = CompanySetting::instance();
        $settings->applySmtpConfig();

        try {
            $recipient = $validated['recipient_email'];
            $companyName = $settings->company_name;

            Mail::raw("Halo,\n\nIni adalah email uji coba dari sistem.\nKoneksi SMTP & Server Email Anda (" . ($settings->mail_host ?? 'localhost') . ") telah terhubung dengan baik!\n\nSalam hangat,\nTeam " . $companyName, function ($message) use ($recipient, $settings) {
                $message->to($recipient)
                    ->subject('Koneksi SMTP Terhubung - Boilerplate Template')
                    ->from($settings->mail_from_address ?? 'noreply@example.com', $settings->mail_from_name ?? $settings->company_name);
            });

            return response()->json([
                'status' => 'success',
                'message' => "Email uji coba berhasil dikirim ke {$recipient}!",
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email uji coba: ' . $e->getMessage(),
            ], 500);
        }
    }
}
