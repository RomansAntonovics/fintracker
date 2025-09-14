import { useForm } from "react-hook-form";
import Loader from './Loader';


const nowForDatetimeLocal = () => {
    const d = new Date();
    const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
    const local = new Date(d.getTime() - tzOffsetMs);
    return local.toISOString().slice(0, 16);
};

export default function TransactionForm({ accountIri, onCreated }) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        defaultValues: { type: "INCOME", amount: 0, description: "", occurredAt: nowForDatetimeLocal() },
        mode: "onChange",
    });

    const submit = async (data) => {
        await onCreated?.(data, { accountIri });
        reset({ type: data.type, amount: 0, description: "", occurredAt: nowForDatetimeLocal() });
    };

    return (
        <form onSubmit={handleSubmit(submit)} style={{ display: "grid", gap: 8, marginBottom: 20 }}>
            <label>Type
                <select {...register("type", { required: "Type is required" })} disabled={isSubmitting} style={{ display: "block", width: "100%" }}>
                    <option value="INCOME">INCOME</option>
                    <option value="EXPENSE">EXPENSE</option>
                </select>
                {errors.type && <small style={{ color: "crimson" }}>{errors.type.message}</small>}
            </label>

            <label>Amount
                <input type="number" step="0.01" {...register("amount", {
                    required: "Amount is required", valueAsNumber: true,
                    validate: (v) => (v > 0 ? true : "Amount must be > 0"),
                })} disabled={isSubmitting} style={{ display: "block", width: "100%" }} />
                {errors.amount && <small style={{ color: "crimson" }}>{errors.amount.message}</small>}
            </label>

            <label>Occurred at (optional)
                <input type="datetime-local" {...register("occurredAt")} disabled={isSubmitting} style={{ display: "block", width: "100%" }} />
            </label>

            <label>Description (optional)
                <input type="text" {...register("description")} disabled={isSubmitting} style={{ display: "block", width: "100%" }} />
            </label>

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader label="Saving…" size="sm" /> : 'Add transaction'}
            </button>        </form>
    );
}
