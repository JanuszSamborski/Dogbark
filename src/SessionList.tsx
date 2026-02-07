import { createResource, For, Show } from "solid-js";
import type { Storage } from "./Storage";
import type { Session } from "./Session";

interface ModalProps {
    show: boolean;
    onClose: () => void;
    onSelect: (session: Session) => void;
    storage: Storage;
}

function SessionList(props: ModalProps) {
    // Resource returns Session[] or empty array if modal is hidden
    const [sessions] = createResource(
        () => props.show,
        async (show) => {
            if (!show) return [];
            return props.storage.readSession();
        }
    );

    return (
        <Show when={props.show}>
            <div
                style={{
                    display: "block",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    "background-color": "var(--pico-background-color)",
                    overflow: "auto"
                }}
            >
                <div style={{ display: "flex", "justify-content": "flex-end" }}>
                    <button style={{ margin: "5px" }} onClick={props.onClose}>Close</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Start</th>
                            <th>End</th>
                        </tr>
                    </thead>
                    <tbody>
                        <For each={sessions() ?? []}>
                            {(s) => (
                                <tr onclick={() => {
                                    props.onSelect(s)
                                    props.onClose()
                                }}
                                    style={{ cursor: 'pointer' }}>
                                    <td>{new Date(s.startTimestap!).toLocaleString()}</td>
                                    <td>{new Date(s.endTimestap!).toLocaleString()}</td>
                                </tr>
                            )}
                        </For>
                        {sessions.loading && (
                            <tr>
                                <td colSpan={2}>Loading...</td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>
        </Show>
    );
}

export default SessionList;
