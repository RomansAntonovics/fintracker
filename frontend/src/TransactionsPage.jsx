import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "./api";

export default function TransactionsPage() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { type: "INCOME", amount: 0, description: "" },
    mode: "onChange",
  });

  const iri = `/api/accounts/${id}`;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const reload = async () => {
    setErr("");
    try {
      const acc = (await api.get(iri, { params: { _t: Date.now() } })).data;
      setAccount(acc);

      const tx = (
        await api.get("/api/transactions", {
          params: { account: iri, "order[occurredAt]": "DESC", _t: Date.now() },
        })
      ).data;
      const list = Array.isArray(tx)
        ? tx
        : tx.member || tx["hydra:member"] || [];
      setItems(list);
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    }
  };

  useEffect(() => {
    reload();
  }, [id]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      setAccount((prev) => {
        if (!prev) return prev;
        const delta =
          data.type === "INCOME" ? Number(data.amount) : -Number(data.amount);
        return {
          ...prev,
          balance: Number((Number(prev.balance ?? 0) + delta).toFixed(2)),
        };
      });

      const occurredAt = data.occurredAt
        ? new Date(data.occurredAt).toISOString()
        : new Date().toISOString();

      await api.post(
        "/api/transactions",
        {
          amount: Number(data.amount),
          type: data.type,
          description: data.description || null,
          occurredAt,
          account: iri,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      reset({ type: data.type, amount: 0, description: "", occurredAt: "" });

      await sleep(150);
      await reload();
    } catch (e) {
      await reload();
      alert(e.response?.data?.detail || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <div style={{ marginBottom: 12 }}>
        <Link to="/">← Back to Accounts</Link>
      </div>

      <h1>Account #{id}</h1>
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      {account && (
        <div
          style={{
            margin: "8px 0 20px",
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <b>{account.name}</b> — <b>{account.balance}</b> {account.currency}
        </div>
      )}

      <h2>Add Transaction</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "grid", gap: 8, marginBottom: 20 }}
      >
        <label>
          Type
          <select
            {...register("type", { required: "Type is required" })}
            disabled={submitting}
            style={{ display: "block", width: "100%" }}
          >
            <option value="INCOME">INCOME</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
          {errors.type && (
            <small style={{ color: "crimson" }}>{errors.type.message}</small>
          )}
        </label>

        <label>
          Amount
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            {...register("amount", {
              required: "Amount is required",
              valueAsNumber: true,
              validate: (v) => (v > 0 ? true : "Amount must be > 0"),
            })}
            disabled={submitting}
            style={{ display: "block", width: "100%" }}
          />
          {errors.amount && (
            <small style={{ color: "crimson" }}>{errors.amount.message}</small>
          )}
        </label>

        <label>
          Occurred at (optional)
          <input
            type="datetime-local"
            placeholder="Occurred at"
            {...register("occurredAt")}
            disabled={submitting}
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <label>
          Description (optional)
          <input
            type="text"
            placeholder="Description"
            {...register("description")}
            disabled={submitting}
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add"}
        </button>
      </form>

      <h2>Transactions</h2>
      {!items.length && <div>No transactions yet.</div>}
      <ul>
        {items.map((t) => (
          <li key={t.id}>
            {t.occurredAt?.slice(0, 16).replace("T", " ")} — {t.type} —{" "}
            <span style={{ color: t.type === "EXPENSE" ? "crimson" : "green" }}>
              {t.type === "EXPENSE" ? "-" : "+"}
              {t.amount}
            </span>
            {t.description ? ` — ${t.description}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
