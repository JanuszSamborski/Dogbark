import type { AudioConfig } from "./AudioConfig";

export class Encoder {
    private encoder?: AudioEncoder;

    constructor(
        private readonly audioConfig: AudioConfig,
        private readonly onChunk?: (chunk: EncodedAudioChunk) => void
    ) { }

    init(): void {
        this.encoder = new AudioEncoder({
            output: this.processAudio,
            error: this.onEncoderError,
        })

        this.encoder.configure({
            codec: "opus",
            sampleRate: this.audioConfig.sampleRate,
            numberOfChannels: this.audioConfig.channelCount,
        })
    }

    encode(data: ArrayBuffer, timestamp: number) {
        if (!this.encoder) {
            return
        }

        const audioData = new AudioData({
            data: data,
            format: "f32-planar",
            numberOfChannels: this.audioConfig.channelCount,
            sampleRate: this.audioConfig.sampleRate,
            numberOfFrames: this.audioConfig.bufferSize,
            timestamp: timestamp,
        })

        this.encoder?.encode(audioData)
    }

    processAudio = (chunk: EncodedAudioChunk, _metadata: any) => {
        this.onChunk?.(chunk)
    }

    onEncoderError(error: Error) {
        console.log(`Audio chunk error: ${error}`)
    }

    async destroy() {
        await this.encoder?.flush()
        this.encoder?.close()
        this.encoder = undefined
    }
}