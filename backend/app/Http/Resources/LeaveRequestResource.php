<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class LeaveRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        $attachmentUrl = null;
        if ($this->attachment) {
            $attachmentUrl = Storage::disk('public')->url($this->attachment);
        }

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                    'role' => $this->user->role,
                    'employee' => $this->user->employee ? [
                        'employee_number' => $this->user->employee->employee_number,
                        'position' => $this->user->employee->position,
                        'department' => $this->user->employee->department,
                    ] : null,
                ];
            }, function () {
                if ($this->user) {
                    return [
                        'id' => $this->user->id,
                        'name' => $this->user->name,
                        'email' => $this->user->email,
                        'role' => $this->user->role,
                    ];
                }
                return null;
            }),
            'type' => $this->type,
            'start_date' => $this->start_date instanceof \DateTimeInterface
                ? $this->start_date->format('Y-m-d')
                : (string) $this->start_date,
            'end_date' => $this->end_date instanceof \DateTimeInterface
                ? $this->end_date->format('Y-m-d')
                : (string) $this->end_date,
            'reason' => $this->reason,
            'attachment' => $this->attachment,
            'attachment_url' => $attachmentUrl,
            'status' => $this->status,
            'reviewed_by' => $this->reviewed_by,
            'reviewer' => $this->whenLoaded('reviewer', function () {
                if (!$this->reviewer) {
                    return null;
                }
                return [
                    'id' => $this->reviewer->id,
                    'name' => $this->reviewer->name,
                    'role' => $this->reviewer->role,
                ];
            }, function () {
                if ($this->reviewer) {
                    return [
                        'id' => $this->reviewer->id,
                        'name' => $this->reviewer->name,
                    ];
                }
                return null;
            }),
            'reviewed_at' => $this->reviewed_at?->toISOString() ?? ($this->reviewed_at ? (string) $this->reviewed_at : null),
            'review_note' => $this->review_note,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
