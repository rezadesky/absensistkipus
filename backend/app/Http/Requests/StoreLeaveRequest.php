<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreLeaveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        $user = $this->user();
        return $user && in_array($user->role, ['dosen', 'tendik']) && $user->isActive();
    }

    /**
     * Handle a failed authorization attempt.
     */
    protected function failedAuthorization()
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki izin untuk mengajukan izin.',
            'errors' => (object) [],
        ], 403));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'type' => 'required|string|in:izin,sakit,dinas,keperluan_keluarga,lainnya',
            'start_date' => 'required|date_format:Y-m-d',
            'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date',
            'reason' => 'required|string|max:2000',
            'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'type.required' => 'Jenis izin wajib dipilih.',
            'type.in' => 'Jenis izin tidak valid.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date_format' => 'Format tanggal mulai harus YYYY-MM-DD.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date_format' => 'Format tanggal selesai harus YYYY-MM-DD.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'reason.required' => 'Alasan izin wajib diisi.',
            'reason.max' => 'Alasan izin maksimal 2000 karakter.',
            'attachment.file' => 'Lampiran harus berupa file yang valid.',
            'attachment.mimes' => 'Format lampiran harus berupa JPG, JPEG, PNG, atau PDF.',
            'attachment.max' => 'Ukuran lampiran maksimal 5MB.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi gagal.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
