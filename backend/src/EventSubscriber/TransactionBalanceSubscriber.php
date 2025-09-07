<?php

namespace App\EventSubscriber;

use App\Entity\Account;
use App\Entity\Transaction;
use App\Service\AccountBalanceService;
use Doctrine\Common\EventSubscriber;
use Doctrine\ORM\Events;
use Doctrine\ORM\Event\PostFlushEventArgs;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Event\PostRemoveEventArgs;
use Doctrine\ORM\Event\PostUpdateEventArgs;

class TransactionBalanceSubscriber implements EventSubscriber
{
    /** @var array<int,true> account ids queued for recalculation */
    private array $pendingAccountIds = [];
    private bool $processing = false;

    public function __construct(
        private AccountBalanceService $balanceService,
    ) {}

    public function getSubscribedEvents(): array
    {
        return [
            Events::postPersist,
            Events::postUpdate,
            Events::postRemove,
            Events::postFlush,
        ];
    }

    public function postPersist(PostPersistEventArgs $args): void
    {
        $e = $args->getObject();
        if (!$e instanceof Transaction) return;

        $acc = $e->getAccount();
        if ($acc && $acc->getId()) {
            $this->pendingAccountIds[$acc->getId()] = true;
        }
    }

    public function postUpdate(PostUpdateEventArgs $args): void
    {
        $e = $args->getObject();
        if (!$e instanceof Transaction) return;

        $uow = $args->getObjectManager()->getUnitOfWork();

        $acc = $e->getAccount();
        if ($acc && $acc->getId()) {
            $this->pendingAccountIds[$acc->getId()] = true;
        }

        $changes = $uow->getEntityChangeSet($e);
        if (isset($changes['account'])) {
            [$oldAcc, $newAcc] = $changes['account'];
            if ($oldAcc && $oldAcc->getId()) $this->pendingAccountIds[$oldAcc->getId()] = true;
            if ($newAcc && $newAcc->getId()) $this->pendingAccountIds[$newAcc->getId()] = true;
        }
    }

    public function postRemove(PostRemoveEventArgs $args): void
    {
        $e = $args->getObject();
        if (!$e instanceof Transaction) return;

        $acc = $e->getAccount();
        if ($acc && $acc->getId()) {
            $this->pendingAccountIds[$acc->getId()] = true;
        }
    }

    public function postFlush(PostFlushEventArgs $args): void
    {
        if ($this->processing || empty($this->pendingAccountIds)) return;

        $this->processing = true;

        $em  = $args->getObjectManager(); // 👈 используем тот же EM, что и в событии
        $ids = array_keys($this->pendingAccountIds);
        $this->pendingAccountIds = [];

        $changed = false;
        foreach ($ids as $id) {
            /** @var Account|null $acc */
            $acc = $em->getRepository(Account::class)->find($id);
            if (!$acc) continue;

            $changed = $this->balanceService->recalc($acc) || $changed;
        }

        if ($changed) {
            $em->flush();
        }
        $this->processing = false;
    }
}
