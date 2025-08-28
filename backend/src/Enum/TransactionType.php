<?php
namespace App\Enum;

enum TransactionType: string
{
    case INCOME = 'INCOME';
    case EXPENSE = 'EXPENSE';
}
