export default function AccountSummary({ account }) {
    if (!account) return null;
    return (
        <div style={{ margin: "8px 0 20px", padding: 12, border: "1px solid #ddd", borderRadius: 8}}>
            <b>{account.name}</b> - <b>{account.balance}</b> {account.currency}
        </div>
    );
}