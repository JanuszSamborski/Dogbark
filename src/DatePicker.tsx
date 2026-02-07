import { createSignal, type JSX } from "solid-js";

type DatePickerProps = {
    value?: number | null; // initial timestamp (ms)
    onChange?: (timestamp: number | null) => void;
};

export function DatePicker(props: DatePickerProps): JSX.Element {
    const toInputValue = (ts: number) => {
        const d = new Date(ts);
        const pad = (n: number) => n.toString().padStart(2, "0");

        return (
            `${d.getFullYear()}-` +
            `${pad(d.getMonth() + 1)}-` +
            `${pad(d.getDate())}T` +
            `${pad(d.getHours())}:` +
            `${pad(d.getMinutes())}`
        );
    };

    const [value, setValue] = createSignal(
        props.value ? toInputValue(props.value) : ""
    );

    const handleChange: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
        const inputValue = e.currentTarget.value;
        setValue(inputValue);

        if (!inputValue) {
            props.onChange?.(null);
            return;
        }

        const timestamp = new Date(inputValue).getTime();
        props.onChange?.(isNaN(timestamp) ? null : timestamp);
    };

    return (
        <input
            type="datetime-local"
            value={value()}
            onInput={handleChange}
            style={{ margin: 0, width: "fit-content" }}
        />
    );
}
