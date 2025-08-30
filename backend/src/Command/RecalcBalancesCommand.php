<?php

namespace App\Command;

use App\Entity\Account;
use App\Service\AccountBalanceService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:recalc:balances')]

class RecalcBalancesCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private AccountBalanceService $balance
    ) { parent::__construct(); }

    protected function execute(InputInterface $input, OutputInterface $out): int
    {
        foreach ($this->em->getRepository(Account::class)->findAll() as $acc) {
            $this->balance->recalc($acc);
        }
        $this->em->flush();
        $out->writeln('Balances recalculated.');
        return Command::SUCCESS;
    }
}
