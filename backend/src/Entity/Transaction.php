<?php

namespace App\Entity;


use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Enum\TransactionType;
use App\Repository\TransactionRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;

#[ORM\Entity(repositoryClass: TransactionRepository::class)]
#[ApiResource(
    order: ['occurredAt' => 'DESC', 'id' => 'DESC'],
    paginationEnabled: true,
    paginationClientEnabled: true,
    paginationClientItemsPerPage: true,
    paginationItemsPerPage: 10
)]
#[ApiFilter(DateFilter::class, properties: ['occurredAt'])]
#[ApiFilter(OrderFilter::class, properties: ['occurredAt', 'amount', 'id'], arguments: ['orderParameterName' => 'order'])]
#[ApiFilter(SearchFilter::class, properties: ['account' => 'exact', 'type' => 'exact'])]
class Transaction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // sum > 0
    #[ORM\Column(type: 'float')]
    #[Assert\NotNull]
    #[Assert\GreaterThan(value: 0)]
    private ?float $amount = null;

    // enum saves like a string
    #[ORM\Column(length: 10, enumType: TransactionType::class)]
    #[Assert\NotNull]
    private ?TransactionType $type = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(name: 'occurred_at', type: 'datetime_immutable')]
    #[Assert\NotNull]
    private ?DateTimeImmutable $occurredAt = null;

    // Link to Account (more transactions → one account)
    #[ORM\ManyToOne(inversedBy: 'transactions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Assert\NotNull]
    private ?Account $account = null;

    // getters/setters ...
    public function getId(): ?int { return $this->id; }
    public function getAmount(): ?float { return $this->amount; }
    public function setAmount(float $amount): static { $this->amount = $amount; return $this; }
    public function getType(): ?TransactionType { return $this->type; }
    public function setType(TransactionType $type): static { $this->type = $type; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): static { $this->description = $d; return $this; }
    public function getOccurredAt(): ?\DateTimeImmutable { return $this->occurredAt; }
    public function setOccurredAt(\DateTimeImmutable $dt): static { $this->occurredAt = $dt; return $this; }
    public function getAccount(): ?Account { return $this->account; }
    public function setAccount(Account $account): static { $this->account = $account; return $this; }
}
