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

    public function recalc(Account $account): void
    {
        $net = $this->transactions->getNetSumForAccount($account);
        $account->setBalance($account->getOpeningBalance() + $net);
        $this->em->persist($account);
    }
}
