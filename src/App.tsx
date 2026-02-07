// --------------------
// External Imports
// --------------------
import { createEffect, createSignal } from 'solid-js';
import './App.css';

// --------------------
// Internal Imports
// --------------------
import { Storage } from './Storage';
import { NewAudio } from './NewAudio';
import { Encoder } from './Encoder';
import { RMS } from './RMS';
import LineChart from './LineChart';
import type { AudioConfig } from './AudioConfig';
import { Session } from './Session';
import SessionList from './SessionList';

// --------------------
// Main App Component
// --------------------
function App() {
  // --------------------
  // State Signals
  // --------------------
  const [recording, setRecording] = createSignal(false);
  const [chartData, setChartData] = createSignal<{ x: Date; y: number }[]>([]);
  const [showSessionModal, setShowSessionModal] = createSignal(false);

  // --------------------
  // Local Variables
  // --------------------
  let wakeLock: WakeLockSentinel | undefined;
  let session: Session | undefined;
  let bufferedPoints: { x: Date; y: number }[] = [];
  // --------------------
  // Audio Configuration
  // --------------------
  const audioConfig: AudioConfig = {
    channelCount: 1,
    sampleRate: 48000,
    bufferSize: 4096,
  };

  // --------------------
  // Class Instances
  // --------------------
  const storage = new Storage();
  storage.init();

  const rms = new RMS(audioConfig);

  const encoder = new Encoder(audioConfig, (data) => {
    const dataBuffer = new Float32Array(data.byteLength);
    data.copyTo(dataBuffer);
    storage.writeAudioChunk(dataBuffer, Date.now()); // TODO: timestamp accuracy
  });

  const onAudioCallback = (data: Float32Array[], timestamp: number) => {
    // Flatten channels into a single buffer
    const buffer = new Float32Array(data[0].length * audioConfig.channelCount);
    for (let ch = 0; ch < audioConfig.channelCount; ch++) {
      buffer.set(data[ch], data[ch].length * ch);
    }

    // Encode audio data
    encoder.encode(buffer.buffer, timestamp);

    // Process RMS and store
    const rmsResult = rms.process(data);
    storage.writeRMS(rmsResult, timestamp);

    // Add point to buffer for chart
    bufferedPoints.push({ x: new Date(timestamp), y: rmsResult[0] });

    if (session) {
      if (!session.startTimestap) {
        session.startTimestap = timestamp;
      }

      session.endTimestap = timestamp;
    }
  };

  const newAudio = new NewAudio(audioConfig, onAudioCallback);

  // --------------------
  // Effects
  // --------------------
  createEffect(() => {
    if (recording()) {
      onRecordingEnable();
    } else {
      onRecordingStop();
    }
  });

  // --------------------
  // Recording Handlers
  // --------------------
  async function onRecordingEnable() {
    wakeLock = await navigator.wakeLock.request("screen");
    setChartData([]);
    await newAudio.init();
    encoder.init();
    session = new Session();
  }

  async function onRecordingStop() {
    newAudio.destroy();
    await encoder.destroy();
    await wakeLock?.release();

    if (session) {
      storage.writeSession(session);
    }
    session = undefined;
  }

  // --------------------
  // Chart Buffer Flushing
  // --------------------
  setInterval(() => {
    if (bufferedPoints.length > 0) {
      setChartData((prev) => [...prev, ...bufferedPoints]);
      bufferedPoints = [];
    }
  }, 1000); // flush every second

  // --------------------
  // Data Loading
  // --------------------
  async function loadData(startDate?: number, endDate?: number) {
    if (!startDate || !endDate) {
      return;
    }
    const data = await storage.readRMS(startDate, endDate);
    const pointData = data?.map((r) => ({ x: new Date(r.key), y: r.value[0] }));
    setChartData(pointData);
  }

  // --------------------
  // UI Rendering
  // --------------------
  return (
    <>

      <div
        style={{
          display: 'flex',
          "flex-direction": 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
        }}
      >

        {/* Chart Container */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            "flex-direction": 'column',
            height: '100%',
          }}
        >
          <LineChart data={chartData()} title="RMS Data" />
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            "justify-content": 'space-between',
            "align-items": 'center',
            padding: '5px',
          }}
        >
          <button disabled={recording()} onClick={() => setShowSessionModal(true)}>Load session</button>
          <button onClick={() => setRecording((v) => !v)}>
            {recording() ? 'Stop' : 'Start'}
          </button>
        </div>
      </div>
      <SessionList show={showSessionModal()} onClose={() => setShowSessionModal(false)} storage={storage} onSelect={(s) => loadData(s.startTimestap, s.endTimestap)} />
    </>
  );
}

export default App;
