export default function TransactionsList({ items }) {
    if (!items?.length) return <div>No transactions yet.</div>;
    return (
        <ul>
            {items.map((t) => (
                <li key={t.id}>
                    {t.occurredAt?.slice(0, 16).replace("T", " ")} — {t.type} —{" "}
                    <span style={{ color: t.type === "EXPENSE" ? "crimson" : "green" }}>
            {t.type === "EXPENSE" ? "-" : "+"}{t.amount}
          </span>
                    {t.description ? ` — ${t.description}` : ""}
                </li>
            ))}
        </ul>
    );
}
