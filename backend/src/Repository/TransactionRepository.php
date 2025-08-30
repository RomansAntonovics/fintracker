<?php

namespace App\Repository;

use App\Entity\Account;
use App\Entity\Transaction;
use App\Enum\TransactionType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class TransactionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Transaction::class);
    }

    public function getNetSumForAccount(Account $account): float
    {
        $qb = $this->createQueryBuilder('t')
            ->select('COALESCE(SUM(CASE WHEN t.type = :income THEN t.amount WHEN t.type = :expense THEN -t.amount ELSE 0 END), 0) as net')
            ->where('t.account = :acc')
            ->setParameter('acc', $account)
            ->setParameter('income', TransactionType::INCOME)
            ->setParameter('expense', TransactionType::EXPENSE);

        return (float) $qb->getQuery()->getSingleScalarResult();
    }
}
