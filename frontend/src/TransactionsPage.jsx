import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "./api";

export default function TransactionsPage() {
    const { id } = useParams();
    const [account, setAccount] = useState(null);
    const [items, setItems] = useState([]);
    const [err, setErr] = useState("");
    const { register, handleSubmit, reset } = useForm({
        defaultValues: { type: "INCOME", amount: 0, description: "" },
    });

    const iri = `/api/accounts/${id}`;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const reload = async () => {
        setErr("");
        try {
            const acc = (await api.get(iri, { params: { _t: Date.now() } })).data;
            setAccount(acc);

            // 2) транзакции (фильтр по аккаунту, сортировка по дате)
            const tx = (await api.get("/api/transactions", {
                params: { account: iri, "order[occurredAt]": "DESC", _t: Date.now() },
            })).data;
            const list = Array.isArray(tx) ? tx : (tx.member || tx["hydra:member"] || []);
            setItems(list);
        } catch (e) {
            setErr(e.response?.data?.detail || e.message);
        }
    };

    useEffect(() => { reload(); }, [id]);

    const onSubmit = async (data) => {
        try {
            const occurredAt = data.occurredAt
                ? new Date(data.occurredAt).toISOString()
                : new Date().toISOString();

            await api.post("/api/transactions", {
                amount: Number(data.amount),
                type: data.type,
                description: data.description || null,
                occurredAt,
                account: iri,
            }, { headers: { "Content-Type": "application/json" } });

            reset({ type: data.type, amount: 0, description: "", occurredAt: "" });

            await sleep(150);
            await reload();
        } catch (e) {
            alert(e.response?.data?.detail || e.message);
        }
    };

    return (
        <div style={{ padding: 16, maxWidth: 720 }}>
            <div style={{ marginBottom: 12 }}>
                <Link to="/">← Back to Accounts</Link>
            </div>

            <h1>Account #{id}</h1>
            {err && <div style={{ color: "crimson" }}>{err}</div>}

            {account && (
                <div style={{ margin: "8px 0 20px", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
                    <b>{account.name}</b> — <b>{account.balance}</b> {account.currency}
                </div>
            )}

            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 8, marginBottom: 20 }}>
                <select {...register("type")}>
                    <option value="INCOME">INCOME</option>
                    <option value="EXPENSE">EXPENSE</option>
                </select>
                <input type="number" step="0.01" placeholder="Amount" {...register("amount", { valueAsNumber: true })} />
                <input type="datetime-local" placeholder="Occurred at" {...register("occurredAt")} />
                <input type="text" placeholder="Description (optional)" {...register("description")} />
                <button type="submit">Add</button>
            </form>

            <h2>Transactions</h2>
            {!items.length && <div>No transactions yet.</div>}
            <ul>
                {items.map((t) => (
                    <li key={t.id}>
                        {t.occurredAt?.slice(0, 16).replace("T", " ")} — {t.type} — {t.amount}
                        {t.description ? ` — ${t.description}` : ""}
                    </li>
                ))}
            </ul>
        </div>
    );
}
