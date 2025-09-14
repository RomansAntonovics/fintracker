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

export async function fetchAccount(iri) {
    const { data } = await api.get(iri, { params: { _t: Date.now() } });
    return data;
}

export async function fetchTransactions(iri, filt) {
    const params = {
        account: iri,
        _t: Date.now(),
        page: filt.page,
        itemsPerPage: filt.itemsPerPage,
        "order[occurredAt]": (filt.order || "desc").toUpperCase(),
    };
    if (filt.type) params.type = filt.type;
    if (filt.from) params["occurredAt[after]"] = toISOStartOfDay(filt.from);
    if (filt.to) params["occurredAt[before]"] = toISOEndOfDay(filt.to);

    const { data } = await api.get("/api/transactions", {
        params,
        headers: { Accept: "application/ld+json" },
    });

    return {
        items: listFromHydra(data),
        total: totalFromHydra(data),
    };
}

export async function createTransaction({ accountIri, payload }) {
    return api.post(
        "/api/transactions",
        {
            amount: Number(payload.amount),
            type: payload.type,
            description: payload.description || null,
            occurredAt: payload.occurredAt
                ? new Date(payload.occurredAt).toISOString()
                : new Date().toISOString(),
            account: accountIri,
        },
        { headers: { "Content-Type": "application/json" } }
    );
}
