import type { AudioConfig } from "./AudioConfig";

export class RMS {

    constructor(
        private readonly audioConfig: AudioConfig,
    ) { }

    process(buffer: Float32Array[]): Float32Array {
        var resultArray = new Float32Array(this.audioConfig.channelCount);
        for (let ch = 0; ch < this.audioConfig.channelCount; ch++) {

            let sumSquares = 0;

            for (let i = 0; i < buffer.length; i++) {
                const s = buffer[ch][i];
                sumSquares += s * s;
            }

            resultArray[ch] = Math.sqrt(sumSquares / buffer.length);
        }

        return resultArray;
    }
}