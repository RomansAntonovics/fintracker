<?php

namespace App\Entity;

use App\Repository\AccountRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;

#[ORM\Entity(repositoryClass: AccountRepository::class)]
#[ApiResource]
class Account
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: 'float')]
    private ?float $balance = null;

    #[ORM\Column(length: 3)]
    private ?string $currency = null;

    #[ORM\OneToMany(mappedBy: 'account', targetEntity: Transaction::class, orphanRemoval: true)]
    private Collection $transactions;

    public function __construct()
    {
        $this->transactions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }
    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getBalance(): ?float
    {
        return $this->balance;
    }
    public function setBalance(float $balance): static
    {
        $this->balance = $balance;
        return $this;
    }

    public function getCurrency(): ?string
    {
        return $this->currency;
    }
    public function setCurrency(string $currency): static
    {
        $this->currency = $currency;
        return $this;
    }

    /** @return Collection<int, Transaction> */
    public function getTransactions(): Collection { return $this->transactions; }
}
