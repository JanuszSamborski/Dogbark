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
        };

        request.onsuccess = () => {
            this.db = request.result;
        };

        request.onerror = () => {
            throw new Error("Error opening database");
        };
    }

    writeAudioChunk(data: ArrayBuffer, timecode: number) {
        if (!this.db) {
            return;
        };

        const tx = this.db.transaction("audio", "readwrite");
        const store = tx.objectStore("audio");

        store.add(data, timecode);
    }
}
