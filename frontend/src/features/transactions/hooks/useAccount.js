import { useState, useEffect, useCallback, useRef } from "react";
import { fetchAccount } from "./useTransactionsApi";

export function useAccount(accountIri) {
    const [account, setAccount] = useState(null);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [errorAccount, setErrorAccount] = useState(null);

    const mountedRef = useRef(false);
    useEffect(() => {
          mountedRef.current = true;
          return () => { mountedRef.current = false; };
        }, []);

    const safeSetState = (fn) => { if (mountedRef.current) fn(); };

    const reloadAccount = useCallback(async () => {
        if (!accountIri) return;
        setLoadingAccount(true);
        setErrorAccount(null);
        try {
            const data = await fetchAccount(accountIri);
            safeSetState(() => setAccount(data));
        } catch (e) {
            safeSetState(() => setErrorAccount(e));
        } finally {
            safeSetState(() => setLoadingAccount(false));
        }
    }, [accountIri]);

    useEffect(() => { reloadAccount(); }, [reloadAccount]);

    return { account, loadingAccount, errorAccount, reloadAccount, setAccount };
}
