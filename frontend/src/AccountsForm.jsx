import { useForm } from "react-hook-form";
import axios from "axios";

export default function AccountsForm({ onCreated }) {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            await axios.post("http://localhost:8080/api/accounts", data, {
                headers: { "Content-Type": "application/json" },
            });
            reset();
            if (onCreated) onCreated();
        } catch (e) {
            console.error(e);
            alert("Ошибка при создании счёта");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: 16 }}>
            <input placeholder="Name" {...register("name", { required: true })} />
            <input placeholder="Balance" type="number" step="0.01" {...register("balance", { valueAsNumber: true })} />
            <input placeholder="Currency" {...register("currency", { required: true })} />
            <button type="submit">Add account</button>
        </form>
    );
}
