import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "./api";

export default function TransactionsPage() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0); // === NEW ===
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // === NEW: локальное состояние фильтров/сортировки/пагинации ===
  const [filters, setFilters] = useState({
    type: "",          // "", "INCOME", "EXPENSE"
    from: "",          // "YYYY-MM-DD"
    to: "",            // "YYYY-MM-DD"
    order: "desc",     // "asc" | "desc"
    page: 1,
    itemsPerPage: 10,
  });

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

  // Хелперы нормализации даты → ISO границы суток (UTC)
  const toISOStartOfDay = (yyyyMmDd) =>
      new Date(`${yyyyMmDd}T00:00:00`).toISOString();
  const toISOEndOfDay = (yyyyMmDd) =>
      new Date(`${yyyyMmDd}T23:59:59`).toISOString();

  const reload = async () => {
    setErr("");
    try {
      const acc = (await api.get(iri, { params: { _t: Date.now() } })).data;
      setAccount(acc);

      const params = {
        account: iri,
        _t: Date.now(),
        page: filters.page,
        itemsPerPage: filters.itemsPerPage,
        "order[occurredAt]": filters.order.toUpperCase(), // ASC/DESC
      };
      if (filters.type) params.type = filters.type;
      if (filters.from) params["occurredAt[after]"] = toISOStartOfDay(filters.from);
      if (filters.to) params["occurredAt[before]"] = toISOEndOfDay(filters.to);

      const tx = (await api.get("/api/transactions", { params })).data;
      const list = Array.isArray(tx) ? tx : tx.member || tx["hydra:member"] || [];
      setItems(list);
      setTotal(tx.totalItems ?? 0); // === NEW ===
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, filters.page, filters.itemsPerPage, filters.order, filters.type, filters.from, filters.to]); // === NEW ===

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

  // === NEW: обработчики фильтров и пагинации ===
  const applyFilters = (evt) => {
    evt.preventDefault();
    setFilters((f) => ({ ...f, page: 1 })); // при смене фильтров сбрасываем на первую страницу
    // reload() вызовется автоматически через useEffect
  };

  const setFilterField = (key, value) =>
      setFilters((f) => ({ ...f, [key]: value }));

  const nextPage = () =>
      setFilters((f) => ({ ...f, page: Math.max(1, f.page + 1) }));
  const prevPage = () =>
      setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }));

  const totalPages = Math.max(1, Math.ceil(total / (filters.itemsPerPage || 10)));

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
        <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 40,
              alignItems: "start",
              marginBottom: 20,
            }}
        >
          <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                backgroundColor: "#fafafa",
              }}
          >
          <div>
        {/* === NEW: панель фильтров транзакций === */}
        <h2>Filters</h2>
        <form
            onSubmit={applyFilters}
            style={{
              display: "grid",
              gap: 8,
              marginBottom: 16,
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
        >
          <label>
            Type
            <select
                value={filters.type}
                onChange={(e) => setFilterField("type", e.target.value)}
                style={{ display: "block", width: "100%" }}
            >
              <option value="">All</option>
              <option value="INCOME">INCOME</option>
              <option value="EXPENSE">EXPENSE</option>
            </select>
          </label>

          <label>
            Order
            <select
                value={filters.order}
                onChange={(e) => setFilterField("order", e.target.value)}
                style={{ display: "block", width: "100%" }}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>

          <label>
            From
            <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilterField("from", e.target.value)}
                style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            To
            <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilterField("to", e.target.value)}
                style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            Items per page
            <select
                value={filters.itemsPerPage}
                onChange={(e) =>
                    setFilterField("itemsPerPage", Number(e.target.value))
                }
                style={{ display: "block", width: "100%" }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>

          <div style={{ alignSelf: "end" }}>
            <button type="submit">Apply</button>
          </div>
        </form>
          </div>
          </div>
          <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                backgroundColor: "#fafafa",
              }}>
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
          </div>
        </div>
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

        {/* === NEW: простая пагинация === */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
          <button
              onClick={prevPage}
              disabled={filters.page <= 1}
          >
            Prev
          </button>
          <span>
          Page {filters.page} / {totalPages}
        </span>
          <button
              onClick={nextPage}
              disabled={filters.page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
  );
}
