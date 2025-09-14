export default function TransactionFilters({ value, onChange, onApply }) {
    const set = (k, v) => onChange({ ...value, [k]: v });

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); onApply?.(); }}
            style={{ display: "grid", gap: 8, marginBottom: 16, gridTemplateColumns: "repeat(2,1fr)" }}
        >
            <label>Type
                <select value={value.type} onChange={(e) => set("type", e.target.value)} style={{ display: "block", width: "100%" }}>
                    <option value="">All</option>
                    <option value="INCOME">INCOME</option>
                    <option value="EXPENSE">EXPENSE</option>
                </select>
            </label>

            <label>Order
                <select value={value.order} onChange={(e) => set("order", e.target.value)} style={{ display: "block", width: "100%" }}>
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                </select>
            </label>

            <label>From
                <input type="date" value={value.from} onChange={(e) => set("from", e.target.value)} style={{ display: "block", width: "100%" }} />
            </label>

            <label>To
                <input type="date" value={value.to} onChange={(e) => set("to", e.target.value)} style={{ display: "block", width: "100%" }} />
            </label>

            <label>Items per page
                <select value={value.itemsPerPage} onChange={(e) => set("itemsPerPage", Number(e.target.value))} style={{ display: "block", width: "100%" }}>
                    <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option>
                </select>
            </label>

            <div style={{ alignSelf: "end" }}>
                <button type="submit">Apply</button>
            </div>
        </form>
    );
}