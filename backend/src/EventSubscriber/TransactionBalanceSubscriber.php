<?php

namespace App\EventSubscriber;

use App\Entity\Transaction;
use App\Service\AccountBalanceService;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Events;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Event\OnFlushEventArgs;
class TransactionBalanceSubscriber implements EventSubscriber
{
    /** @var array<int,true> account.id list */
    private array $pendingAccountIds = [];
    private bool $processing = false;
public function __construct(
    private AccountBalanceService $balance,
    private EntityManagerInterface $em,
) {}

    public function getSubscribedEvents(): array
    {
        return [Events::onFlush, Events::postFlush];
    }

    public function onFlush(OnFlushEventArgs $args): void
    {
        $em  = $args->getObjectManager();
        $uow = $em->getUnitOfWork();

        foreach ($uow->getScheduledEntityInsertions() as $entity) {
            if ($entity instanceof Transaction) {
                $acc = $entity->getAccount();
                if ($acc && $acc->getId()) { $this->pendingAccountIds[$acc->getId()] = true; }
            }
        }

        foreach ($uow->getScheduledEntityUpdates() as $entity) {
            if ($entity instanceof Transaction) {
                $acc = $entity->getAccount();
                if ($acc && $acc->getId()) { $this->pendingAccountIds[$acc->getId()] = true; }

                $changes = $uow->getEntityChangeSet($entity);
                if (isset($changes['account'])) {
                    [$oldAcc, $newAcc] = $changes['account'];
                    if ($oldAcc && $oldAcc->getId()) { $this->pendingAccountIds[$oldAcc->getId()] = true; }
                    if ($newAcc && $newAcc->getId()) { $this->pendingAccountIds[$newAcc->getId()] = true; }
                }
            }
        }

        foreach ($uow->getScheduledEntityDeletions() as $entity) {
            if ($entity instanceof Transaction) {
                $acc = $entity->getAccount();
                if ($acc && $acc->getId()) { $this->pendingAccountIds[$acc->getId()] = true; }
            }
        }
    }

    public function postFlush(PostFlushEventArgs $args): void
    {
        if ($this->processing || empty($this->pendingAccountIds)) {
            return;
        }
        $this->processing = true;

        $ids = array_keys($this->pendingAccountIds);
        $this->pendingAccountIds = [];

        foreach ($ids as $id) {
            /** @var Account|null $acc */
            $acc = $this->em->getRepository(Account::class)->find($id);
            if ($acc) {
                $this->balance->recalc($acc);
            }
        }

        $this->em->flush();
        $this->processing = false;
    }
}
