<?php

namespace App\Exceptions;

use Exception;

class AttendanceException extends Exception
{
    protected int $statusCode;
    protected array $errors;

    public function __construct(string $message, int $statusCode = 422, array $errors = [])
    {
        parent::__construct($message, $statusCode);
        $this->statusCode = $statusCode;
        $this->errors = $errors;
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
