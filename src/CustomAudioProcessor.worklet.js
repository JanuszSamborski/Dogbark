class CustomAudioProcessor extends AudioWorkletProcessor {
   constructor(options) {
      super(options);
      this.buffer = [];
      this.writeIndex = 0;
      this.timestamp = undefined;
      this.audioConfig = options?.processorOptions;
      for (var ch = 0; ch < this.audioConfig.channelCount; ch++) {
         this.buffer[ch] = new Float32Array(this.audioConfig.bufferSize);
      }
   }

   process(inputs, outputs, parameters) {
      if (!this.timestamp) {
         this.timestamp = Date.now();
      }

      var channelCount = this.audioConfig.channelCount;
      for (var ch = 0; ch < channelCount; ch++) {
         var data = inputs[0][ch];
         this.buffer[ch].set(data, this.writeIndex);
      }

      this.writeIndex += 128;

      if (this.writeIndex >= this.audioConfig.bufferSize) {
         this.port.postMessage([this.buffer.slice(0), this.timestamp]);
         this.timestamp = undefined;
         this.writeIndex = 0;
      }

      return true;
   }
}

registerProcessor("custom-audio-processor", CustomAudioProcessor);
