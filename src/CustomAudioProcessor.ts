import type { AudioConfig } from "./AudioConfig";

class CustomAudioProcessor extends AudioWorkletProcessor {
   private buffer: Float32Array[];
   private writeIndex = 0;
   private timestamp?: number;
   private audioConfig: AudioConfig;

   constructor(
      options?: AudioWorkletNodeOptions
   ) {
      super();
      this.audioConfig = options?.processorOptions;
      this.buffer = [];
      for (let ch = 0; ch < this.audioConfig.channelCount; ch++) {
         this.buffer[ch] = new Float32Array(this.audioConfig.bufferSize)
      }
   }

   process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean {
      if (!this.timestamp) {
         this.timestamp = Date.now()
      }

      for (let ch = 0; ch < this.audioConfig.channelCount; ch++) {
         const data = inputs[0][ch]
         this.buffer[ch].set(data, this.writeIndex)
      }

      this.writeIndex += 128;

      if (this.writeIndex >= this.audioConfig.bufferSize) {
         this.port.postMessage([this.buffer.slice(0), this.timestamp])
         this.timestamp = undefined;
         this.writeIndex = 0;
      }

      return true;
   }
}

registerProcessor("custom-audio-processor", CustomAudioProcessor)
