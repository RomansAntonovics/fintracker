import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AccountSummary from "../features/transactions/components/AccountSummary";
import TransactionFilters from "../features/transactions/components/TransactionFilters";
import TransactionForm from "../features/transactions/components/TransactionForm";
import TransactionsList from "../features/transactions/components/TransactionsList";
import Pager from "../features/transactions/components/Pager";
import {
  fetchAccount, fetchTransactions, createTransaction,
} from "../features/transactions/hooks/useTransactionsApi";

export default function TransactionsPage() {
  const { id } = useParams();
  const accountIri = `/api/accounts/${id}`;

  const [account, setAccount] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState("");

  const [filters, setFilters] = useState({
    type: "", from: "", to: "", order: "desc", page: 1, itemsPerPage: 10,
  });

  const reload = async () => {
    setErr("");
    try {
      const [acc, tx] = await Promise.all([
        fetchAccount(accountIri),
        fetchTransactions(accountIri, filters),
      ]);
      setAccount(acc);
      setItems(tx.items);
      setTotal(tx.total);
    } catch (e) {
      setErr(e.response?.data?.detail || e.message);
    }
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [
    id, filters.page, filters.itemsPerPage, filters.order, filters.type, filters.from, filters.to,
  ]);

  const onApplyFilters = () => setFilters((f) => ({ ...f, page: 1 }));
  const nextPage = () => setFilters((f) => ({ ...f, page: Math.max(1, f.page + 1) }));
  const prevPage = () => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }));

  const onCreated = async (formData) => {
    // optimistic balance update
    setAccount((prev) => {
      if (!prev) return prev;
      const delta = formData.type === "INCOME" ? Number(formData.amount) : -Number(formData.amount);
      return { ...prev, balance: Number((Number(prev.balance ?? 0) + delta).toFixed(2)) };
    });
    try {
      await createTransaction({ accountIri, payload: formData });
      await reload();
    } catch (e) {
      await reload();
      alert(e.response?.data?.detail || e.message);
    }
  };

  return (
      <div style={{ padding: 16, maxWidth: 720 }}>
        <div style={{ marginBottom: 12 }}><Link to="/">← Back to Accounts</Link></div>
        <h1>Account #{id}</h1>
        {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

        <AccountSummary account={account} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start", marginBottom: 20 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, backgroundColor: "#fafafa" }}>
            <h2>Filters</h2>
            <TransactionFilters value={filters} onChange={setFilters} onApply={onApplyFilters} />
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, backgroundColor: "#fafafa" }}>
            <h2>Add Transaction</h2>
            <TransactionForm accountIri={accountIri} onCreated={onCreated} />
          </div>
        </div>

        <h2>Transactions</h2>
        <TransactionsList items={items} />

        <Pager
            page={filters.page}
            total={total}
            perPage={filters.itemsPerPage}
            onPrev={prevPage}
            onNext={nextPage}
        />
      </div>
  );
}
