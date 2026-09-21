<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'attendance_date' => $this->attendance_date instanceof \DateTimeInterface
                ? $this->attendance_date->format('Y-m-d')
                : (string) $this->attendance_date,
            'check_in' => $this->check_in?->toISOString() ?? ($this->check_in ? (string) $this->check_in : null),
            'check_in_time' => $this->check_in ? $this->check_in->format('H:i:s') : null,
            'status' => $this->status,
            'notes' => $this->notes,
            'user' => $this->whenLoaded('user', function () {
                return new UserResource($this->user);
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
