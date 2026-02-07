import type { Session } from "./Session";

export class Storage {
    private db?: IDBDatabase;

    init(): void {
        const request = window.indexedDB.open("AudioStorage", 1);

        request.onupgradeneeded = () => {
            this.db = request.result;

            if (!this.db.objectStoreNames.contains("audio")) {
                const store = this.db.createObjectStore("audio");
                store.createIndex("timecode", "timecode");
            }

            if (!this.db.objectStoreNames.contains("rms")) {
                const store = this.db.createObjectStore("rms");
                store.createIndex("timecode", "timecode");
            }

            if (!this.db.objectStoreNames.contains("session")) {
                this.db.createObjectStore("session", { autoIncrement: true });
            }


        };

        request.onsuccess = () => {
            this.db = request.result;
        };

        request.onerror = () => {
            throw new Error("Error opening database");
        };
    }

    writeAudioChunk(data: Float32Array, timecode: number) {
        if (!this.db) {
            return;
        };

        const tx = this.db.transaction("audio", "readwrite");
        const store = tx.objectStore("audio");

        store.add(data, timecode);
    }

    writeSession(data: Session) {
        if (!this.db) {
            return;
        };

        const tx = this.db.transaction("session", "readwrite");
        const store = tx.objectStore("session");

        store.add(data);
    }

    async readSession() {
        if (!this.db) {
            return;
        };

        const tx = this.db.transaction("session", "readonly");
        const store = tx.objectStore("session");


        return new Promise<Session[]>((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result)
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    writeRMS(data: Float32Array, timecode: number) {
        if (!this.db) {
            return;
        };

        const tx = this.db.transaction("rms", "readwrite");
        const store = tx.objectStore("rms");

        store.add(data, timecode);
    }

    async readRMS(startTimecode: number, endTimecode: number) {
        if (!this.db) return [];

        const tx = this.db.transaction("rms", "readonly");
        const store = tx.objectStore("rms");

        const range = IDBKeyRange.bound(startTimecode, endTimecode);

        return new Promise<{ key: number; value: Float32Array }[]>((resolve, reject) => {
            const results: { key: number; value: Float32Array }[] = [];
            const request = store.openCursor(range);

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    results.push({ key: cursor.key as number, value: cursor.value });
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }


    onChunk = (data: EncodedAudioChunk) => {
        const buffer = new Float32Array(data.byteLength);
        data.copyTo(buffer);
        this.writeAudioChunk(buffer, data.timestamp) //TODO: this should be timestamp of encoded chunk
    }

    clear(): void {
        if (!this.db) {
            return;
        }

        const tx = this.db.transaction(["audio", "rms"], "readwrite");

        tx.objectStore("audio").clear();
        tx.objectStore("rms").clear();
    }
}
