export class AudioMediaRecorder {
  private stream?: MediaStream;
  private mediaRecorder?: MediaRecorder;
  private timeslice?: number;
  private onData?: (data: ArrayBuffer, timecode: number) => void;

  constructor() { }

  async init(onData: (data: ArrayBuffer, timecode: number,) => void, timeslice: number = 10000): Promise<void> {
    this.timeslice = timeslice;
    this.onData = onData;
    // Request mic access
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });


    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: "audio/webm;codecs=opus"
    });

    this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
  };

  startRecording(): void {
    console.log("Starting recording");
    this.mediaRecorder?.start(this.timeslice);
  }

  stopRecording(): void {
    console.log("Stopping recording");
    this.mediaRecorder?.stop();
  }

  async handleDataAvailable(event: BlobEvent): Promise<void> {
    const data = await event.data.arrayBuffer()
    this.onData?.(data, event.timecode);
  }

  destroy(): void {
    this.stream?.getTracks().forEach(track => track.stop());
    this.mediaRecorder?.stop();
    this.mediaRecorder = undefined;
    this.stream = undefined;
  }
}
