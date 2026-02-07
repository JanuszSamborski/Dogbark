export class EncodedAudioFileWriter {
    private chunks: ArrayBuffer[] = [];
    private filename: string;

    constructor(filename: string = 'audio.enc') {
        this.filename = filename;
    }

    /** Store a single EncodedAudioChunk in memory */
    public writeChunk = (chunk: EncodedAudioChunk) => {
        const buffer = new ArrayBuffer(chunk.byteLength);
        chunk.copyTo(buffer);
        this.chunks.push(buffer);
    }

    /** Create a downloadable file from all chunks */
    public save(): void {
        if (this.chunks.length === 0) {
            console.warn("No data to save!");
            return;
        }

        // Merge all ArrayBuffers into one Blob
        const blob = new Blob(this.chunks, { type: 'audio/ogg' });

        // Create a temporary <a> element to trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log(`File "${this.filename}" ready for download (${blob.size} bytes).`);
    }

    /** Clear stored chunks */
    public clear(): void {
        this.chunks = [];
    }
}
