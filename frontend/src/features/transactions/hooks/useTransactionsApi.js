import { api } from "../../../api";

const listFromHydra = (data) =>
    Array.isArray(data) ? data : data.member || data["hydra:member"] || [];

const totalFromHydra = (data) =>
    (typeof data.totalItems === "number" ? data.totalItems : undefined) ??
    (typeof data["hydra:totalItems"] === "number"
        ? data["hydra:totalItems"]
        : undefined) ?? 0;

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
    const items = Array.isArray(data) ? data : data.member || data["hydra:member"] || [];
    const total =
        (typeof data.totalItems === "number" ? data.totalItems : undefined) ??
        (typeof data["hydra:totalItems"] === "number" ? data["hydra:totalItems"] : undefined) ??
        0;
    return { items, total };
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
    await api.post("/api/transactions", body, {
        headers: { "Content-Type": "application/json" },
    });
}
