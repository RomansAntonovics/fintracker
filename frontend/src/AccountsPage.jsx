import {useEffect, useState} from "react";
import axios from "axios";

export default function AccountsPage() {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8080/api/accounts", {
            headers: {Accept: "application/json"}
        })
            .then(res => {
                const data = res.data;
                const items = Array.isArray(data)
                    ? data
                    : (data.member || data["hydra:member"] || []);
                setItems(items);
            })
            .catch(e => setErr(e.response?.data?.detail || e.message));
    }, []);
    
    return (
        <div style={{padding: 16}}>
            <h1>Accounts</h1>
            {err && <div style={{color: "crimson"}}>{err}</div>}
            <ul>
                {items.map(a => (
                    <li key={a.id}>
                        {a.name} — {a.balance} {a.currency}
                    </li>
                ))}
            </ul>
        </div>
    );
}
    