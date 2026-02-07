import type { AudioConfig } from "./AudioConfig";

export class Decoder {
    private decoder?: AudioDecoder;

    constructor(
        private readonly audioConfig: AudioConfig,
        private readonly onChunk: (output: AudioData) => void
    ) {
    }

    init(): void {
        this.decoder = new AudioDecoder({
            output: this.processAudio,
            error: this.onDecoderError,
        });

        this.decoder.configure({
            codec: "opus",
            sampleRate: this.audioConfig.sampleRate,
            numberOfChannels: this.audioConfig.channelCount,
        });
    }

    decode = (data: EncodedAudioChunk) => {
        this.decoder?.decode(data);
    }

    private processAudio = (output: AudioData) => {
        this.onChunk(output); // keep your callback
        output.close();
    }

    private onDecoderError = (error: Error) => {
        console.error(`Audio chunk error: ${error}`);
    }

    async close() {
        await this.decoder?.flush();
        this.decoder?.close();
        this.decoder = undefined;
    }
}
