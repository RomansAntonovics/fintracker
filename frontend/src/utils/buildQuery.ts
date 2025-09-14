export type TxnQuery = {
    type?: 'INCOME' | 'EXPENSE';
    after?: string;
    before?: string;
    order?: 'asc' | 'desc';
    page?: number;
    itemsPerPage?: number;
    accountIri?: string;
};

export function buildTransactionsSearchParams(q: TxnQuery): URLSearchParams {
    const sp = new URLSearchParams();
    
    if (q.type) sp.set('type', q.type);
    if (q.after) sp.set('occurredAt[after]', q.after);
    if (q.before) sp.set('occurredAt[before]', q.before);
    if (q.order) sp.set('order[occurredAt]', q.order);

    sp.set('page', String(q.page ?? 1));
    sp.set('itemsPerPage', String(q.itemsPerPage ?? 10));
    
    if (q.accountIri) sp.set('account', q.accountIri);
    
    return sp;
}