import Loader from './Loader';
import './transactionsList.css';

export default function TransactionsList({ items, loading }) {
    return (
        <div className="txn-list__wrap">
            {loading && <Loader overlay label="Loading transactions…" />}
            <table className="txn-list__table">
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Note</th>
                </tr>
                </thead>
                <tbody>
                {!loading && items.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', opacity: 0.7 }}>No transactions</td></tr>
                )}
                {items.map((t) => {
                    const isExpense = t.type === 'EXPENSE';
                    const sign = isExpense ? '-' : '+';
                    const cls = `txn--amount ${isExpense ? 'txn--expense' : 'txn--income'}`;
                    return (
                        <tr key={t['@id'] || t.id}>
                            <td>{new Date(t.occurredAt).toLocaleString()}</td>
                            <td>{t.type}</td>
                            <td style={{ textAlign: 'right' }}>
                  <span className={cls} aria-label={t.type.toLowerCase()}>
                    {sign}{t.amount}
                  </span>
                            </td>
                            <td>{t.description || t.note || '—'}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
