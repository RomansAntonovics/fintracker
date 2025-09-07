<?php

namespace App\Service;

use App\Entity\Account;
use App\Repository\TransactionRepository;
use Doctrine\ORM\EntityManagerInterface;

class AccountBalanceService
{
 public function __construct(
     private TransactionRepository $transactions,
     private EntityManagerInterface $em,
 ) {}

    public function recalc(Account $account): bool
    {
        $net = $this->transactions->getNetSumForAccount($account);
        $new = $account->getOpeningBalance() + $net;

        if (abs(($account->getBalance() ?? 0.0) - $new) > 1e-9) {
            $account->setBalance($new);
            $this->em->persist($account);
            return true;
        }
        return false;
    }
}
