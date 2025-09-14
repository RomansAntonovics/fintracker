import Loader from "./Loader";

export default function AccountSummary({ account, loading }) {
    return (
        <div
            style={{
                margin: "8px 0 20px",
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
                position: "relative",
                minHeight: 48,
                display: "flex",
                alignItems: "center",
            }}
        >
            {loading && <Loader overlay label="Loading account_" />}
            {!loading && account && (
                <>
                <b>{account.name}</b> - <b>{account.balance}</b> {account.currency}
                </>
            )}
        </div>
    );
    // if (!account) return null;
    // return (
    //     <div style={{ margin: "8px 0 20px", padding: 12, border: "1px solid #ddd", borderRadius: 8}}>
    //         <b>{account.name}</b> - <b>{account.balance}</b> {account.currency}
    //     </div>
    // );
}