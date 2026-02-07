import type { AudioConfig } from "./AudioConfig";
import audioProcessorUrl from "./CustomAudioProcessor.ts?url"

export class NewAudio {
    private stream?: MediaStream;
    private audioContext?: AudioContext;
    private audioSource?: MediaStreamAudioSourceNode;
    private workletNode?: AudioWorkletNode;

    constructor(
        private readonly audioConfig: AudioConfig,
        private onData?: (data: Float32Array[], timestamp: number) => void
    ) { }

    async init(): Promise<void> {

        // Request mic access
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                autoGainControl: false,
                channelCount: this.audioConfig.channelCount,
                echoCancellation: false,
                noiseSuppression: false,
                sampleRate: this.audioConfig.sampleRate,
                // sampleSize: 100,
            },
        });

        this.audioContext = new AudioContext({})
        this.audioSource = this.audioContext.createMediaStreamSource(this.stream)
        await this.audioContext.audioWorklet.addModule(audioProcessorUrl)
        this.workletNode = new AudioWorkletNode(this.audioContext, "custom-audio-processor", { processorOptions: this.audioConfig })
        this.audioSource.connect(this.workletNode);

        this.workletNode.port.onmessage = (event: MessageEvent) => {
            this.handleDataAvailable(event)
        }
    };

    handleDataAvailable(event: MessageEvent<[Float32Array[], number]>): void {
        const data = event.data[0]
        const timestamp = event.data[1]
        this.onData?.(data, timestamp);
    }

    destroy(): void {
        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = undefined;
        this.audioContext?.close()
        this.audioContext = undefined;
        this.audioSource?.disconnect();
        this.audioSource = undefined;
        this.workletNode?.disconnect();
        this.workletNode = undefined;
    }
}
