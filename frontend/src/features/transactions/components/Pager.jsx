export default function Pager({ page, total, perPage, onPrev, onNext }) {
    const totalPages = Math.max(1, Math.ceil((total || 0) / (perPage || 10)));
    return (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12 }}>
            <button onClick={onPrev} disabled={page <= 1}>Prev</button>
            <span>Page {page} / {totalPages}</span>
            <button onClick={onNext} disabled={page >= totalPages}>Next</button>
        </div>
    );
}
