import { api } from "../../../api";
import { useState, useCallback, useRef, useEffect } from "react";
import { buildTransactionsSearchParams } from "../../../utils/buildQuery";

const listFromHydra = (data) =>
    Array.isArray(data) ? data : data.member || data["hydra:member"] || [];

const totalFromHydra = (data) =>
    (typeof data.totalItems === "number" ? data.totalItems : undefined) ??
    (typeof data["hydra:totalItems"] === "number"
        ? data["hydra:totalItems"]
        : undefined) ??
    0;

export function toISOStartOfDay(yyyyMmDd) {
    return new Date(`${yyyyMmDd}T00:00:00`).toISOString();
}
export function toISOEndOfDay(yyyyMmDd) {
    return new Date(`${yyyyMmDd}T23:59:59`).toISOString();
}

export async function fetchAccount(accountIri) {
    const { data } = await api.get(accountIri, { params: { _t: Date.now() } });
    return data;
}

export async function fetchTransactions(params) {
    const { data } = await api.get("/api/transactions", {
        params,
        headers: { Accept: "application/ld+json" },
    });
    return { items: listFromHydra(data), total: totalFromHydra(data) };
}

export async function createTransaction({ accountIri, payload }) {
    const body = {
        amount: Number(payload.amount),
        type: payload.type,
        description: payload.description || null,
        occurredAt: payload.occurredAt
            ? new Date(payload.occurredAt).toISOString()
            : new Date().toISOString(),
        account: accountIri,
    };
    const { data } = await api.post("/api/transactions", body, {
        headers: { "Content-Type": "application/json" },
    });
    return data;
}

/** ------- Hook with loading flags ------- */
export function useTransactionsApi() {
    const [items, setItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loadingList, setLoadingList] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const mountedRef = useRef(false);
    useEffect(() => {
          mountedRef.current = true;
          return () => { mountedRef.current = false; };
        }, []);

    const safeSetState = useCallback((fn) => {
        if (mountedRef.current) fn();
    }, []);

    /** List loading */
    const fetchTransactionsSafe = useCallback(async (query) => {
        setLoadingList(true);
        setError(null);
        try {
            const q = {
                page: 1,
                itemsPerPage: 10,
                ...query,
            };
            // build URLSearchParams -> ordinary object for axios
            const sp = buildTransactionsSearchParams(q);
            const params = Object.fromEntries(sp.entries());
            const { items, total } = await fetchTransactions(params);
            safeSetState(() => {
                setItems(items);
                setTotalItems(total);
            });
        } catch (e) {
            safeSetState(() => setError(e));
        } finally {
            safeSetState(() => setLoadingList(false));
        }
    }, [safeSetState]);

    /** transaction create */
    const createTransactionSafe = useCallback(async ({ accountIri, payload }) => {
        setSubmitting(true);
        setError(null);
        try {
            const data = await createTransaction({ accountIri, payload });
            return data;
        } catch (e) {
            safeSetState(() => setError(e));
            throw e;
        } finally {
            safeSetState(() => setSubmitting(false));
        }
    }, [safeSetState]);

    /** Error reset manually */
    const resetError = useCallback(() => setError(null), []);

    return {
        // data
        items,
        totalItems,
        // state
        loadingList,
        submitting,
        error,
        resetError,
        // actions
        fetchTransactions: fetchTransactionsSafe,
        createTransaction: createTransactionSafe,
    };
}
