<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'employee' => $this->whenLoaded('employee', function () {
                if (!$this->employee) {
                    return null;
                }
                return [
                    'id' => $this->employee->id,
                    'employee_number' => $this->employee->employee_number,
                    'employee_type' => $this->employee->employee_type,
                    'position' => $this->employee->position,
                    'department' => $this->employee->department,
                    'phone' => $this->employee->phone,
                ];
            }, function () {
                if (!$this->relationLoaded('employee') && $this->employee) {
                    return [
                        'id' => $this->employee->id,
                        'employee_number' => $this->employee->employee_number,
                        'employee_type' => $this->employee->employee_type,
                        'position' => $this->employee->position,
                        'department' => $this->employee->department,
                        'phone' => $this->employee->phone,
                    ];
                }
                return null;
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
