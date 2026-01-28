import { Audio } from './Audio'
import { Storage } from './Storage';
import './App.css'

function App() {
  const storage = new Storage();
  storage.init();
  const audio = new Audio();
  audio.init(storage.writeAudioChunk.bind(storage));


  return (
    <>
      <div class="card">
        <button onClick={() => audio.startRecording()}>
          Start
        </button>
            <button onClick={() => audio.stopRecording()}>
          Stop
        </button>
      </div>
    </>
  )
}

export default App
