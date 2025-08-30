<?php

namespace App\Entity;

use App\Repository\AccountRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: AccountRepository::class)]
#[ApiResource]
class Account
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "Name is required")]
    #[Assert\Length(max: 255, maxMessage: "Name must be at most 255 characters")]
    private ?string $name = null;

    #[ORM\Column(type: 'float')]
    #[Assert\NotNull(message: "Balance is required")]
    #[Assert\Type(type: 'numeric', message: "Balance must be a number")]
    #[Assert\GreaterThanOrEqual(value: 0, message: "Balance cannot be negative")]
    private ?float $balance = null;

    #[ORM\Column(type: 'float')]
    private float $openingBalance = 0.0;

    public function getOpeningBalance(): float { return $this->openingBalance; }
    public function setOpeningBalance(float $v): static { $this->openingBalance = $v; return $this; }


    #[ORM\Column(length: 3)]
    #[Assert\NotBlank(message: "Currency is required")]
    #[Assert\Length(
        min: 3,
        max: 3,
        exactMessage: "Currency must be exactly 3 letters (ISO 4217)"
    )]
    #[Assert\Regex(
        pattern: "/^[A-Z]{3}$/",
        message: "Currency must be uppercase ISO code (e.g. EUR, USD)"
    )]
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
