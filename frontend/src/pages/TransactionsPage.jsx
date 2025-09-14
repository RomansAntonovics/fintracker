import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAccount } from "../features/transactions/hooks/useAccount";
import AccountSummary from "../features/transactions/components/AccountSummary";
import TransactionFilters from "../features/transactions/components/TransactionFilters";
import TransactionForm from "../features/transactions/components/TransactionForm";
import TransactionsList from "../features/transactions/components/TransactionsList";
import Pager from "../features/transactions/components/Pager";
import { useTransactionsApi } from "../features/transactions/hooks/useTransactionsApi";

export default function TransactionsPage() {
    const { id } = useParams();
    const accountIri = `/api/accounts/${id}`;

    // const [account, setAccount] = useState(null);
    const [err, setErr] = useState("");

    const [filters, setFilters] = useState({
        type: "", from: "", to: "", order: "desc", page: 1, itemsPerPage: 10,
    });

    const {
        items,
        totalItems,
        loadingList,
        submitting,
        error,
        fetchTransactions,
        createTransaction,
    } = useTransactionsApi();

    const {
        account,
        loadingAccount,
        errorAccount,
        setAccount,
        reloadAccount,
    } = useAccount(accountIri);

    const reload = useCallback(async () => {
        setErr("");
        try {
            await reloadAccount();
            const query = { ...filters, accountIri };
            await fetchTransactions(query);
        } catch (e) {
            setErr(e.response?.data?.detail || e.message);
        }
    }, [accountIri, filters, reloadAccount, fetchTransactions]);

    useEffect(() => { reload(); }, [reload]);

    const onApplyFilters = () => setFilters((f) => ({ ...f, page: 1 }));
    const nextPage = () => setFilters((f) => ({ ...f, page: Math.max(1, f.page + 1) }));
    const prevPage = () => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }));

    const onCreated = async (formData) => {
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

            {(err || error || errorAccount) && (
                <div style={{ color: "crimson", marginBottom: 8 }}>
                    {err || error?.message || errorAccount?.message}
                </div>
            )}

            <AccountSummary account={account} loading={loadingAccount} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start", marginBottom: 20 }}>
                <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, backgroundColor: "#fafafa" }}>
                    <h2>Filters</h2>
                    <TransactionFilters value={filters} onChange={setFilters} onApply={onApplyFilters} />
                </div>

                <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, backgroundColor: "#fafafa" }}>
                    <h2>Add Transaction</h2>
                    <TransactionForm accountIri={accountIri} onCreated={onCreated} submitting={submitting} />
                </div>
            </div>

            <h2>Transactions</h2>
            <TransactionsList items={items} loading={loadingList} />

            <Pager
                page={filters.page}
                total={totalItems}
                perPage={filters.itemsPerPage}
                onPrev={prevPage}
                onNext={nextPage}
            />
        </div>
    );
}
