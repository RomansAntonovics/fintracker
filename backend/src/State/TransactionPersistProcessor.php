<?php
namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Transaction;
use App\Service\AccountBalanceService;
use Doctrine\ORM\EntityManagerInterface;

final class TransactionPersistProcessor implements ProcessorInterface
{
    public function __construct(
        private ProcessorInterface $inner,
        private AccountBalanceService $balanceService,
        private EntityManagerInterface $em,
    ) {}

    /** @param Transaction $data */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        $result = $this->inner->process($data, $operation, $uriVariables, $context);

        if ($data instanceof Transaction && null !== $data->getAccount()) {
            $this->balanceService->recalc($data->getAccount());
            $this->em->flush();
        }

        return $result;
    }
}
