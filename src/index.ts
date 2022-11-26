import "./main.css"
import Alpine from "alpinejs"
import * as vad from "@ricky0123/vad"
let _window = window as any
_window.Alpine = Alpine
Alpine.start()

enum DemoState {
  before = "before",
  during = "during",
  loading = "loading",
  errored = "errored",
}

const updateDemoState = (newState: DemoState) => {
  const ev = new CustomEvent("demo-state-change", {
    detail: { demoState: newState },
  })
  window.dispatchEvent(ev)
}

let myvad: vad.MicVAD

function updateIndicatorColor(
  isSpeech: number,
  positiveSpeechThreshold: number,
  element: HTMLElement
) {
  const current = element.style.getPropertyValue("--color")
  if (isSpeech > positiveSpeechThreshold && current != "red") {
    element.style.setProperty("--color", "red")
  } else if (isSpeech < positiveSpeechThreshold && current != "blue") {
    element.style.setProperty("--color", "blue")
  }
}

function updateIndicatorSpeed(
  isSpeech: number,
  positiveSpeechThreshold: number,
  element: HTMLElement
) {
  const lower = `0.1s`
  const upper = `0.75s`
  const current = element.style.getPropertyValue("--speed")
  if (isSpeech > positiveSpeechThreshold && current != lower) {
    element.style.setProperty("--speed", lower)
  } else if (isSpeech < positiveSpeechThreshold && current != upper) {
    element.style.setProperty("--speed", upper)
  }
}

async function startDemo() {
  updateDemoState(DemoState.loading)

  try {
    let counter = 0
    const indicatorRefreshRate = 4
    myvad = await vad.MicVAD.new({
      positiveSpeechThreshold: 0.8,
      minSpeechFrames: 5,
      preSpeechPadFrames: 10,
      onFrameProcessed: (probs) => {
        if (counter % indicatorRefreshRate == 0) {
          const indicator: HTMLElement = document.querySelector("#indicator")
          updateIndicatorColor(
            probs.isSpeech,
            myvad.options.positiveSpeechThreshold,
            indicator
          )
          updateIndicatorSpeed(
            probs.isSpeech,
            myvad.options.positiveSpeechThreshold,
            indicator
          )
        }
        counter = (counter + 1) % indicatorRefreshRate
      },
      onSpeechEnd: (audio) => {
        const wavBuffer = vad.utils.encodeWAV(audio)
        const base64 = vad.utils.arrayBufferToBase64(wavBuffer)
        const url = `data:audio/wav;base64,${base64}`
        const template: HTMLTemplateElement = document.querySelector(
          "#playlist_entry_template"
        )
        const entry = template.content.cloneNode(true)
        const audioNode: HTMLAudioElement = (entry as any).querySelector(
          "audio"
        )
        audioNode.src = url
        const playlist: HTMLOListElement = document.querySelector("#playlist")
        playlist.prepend(entry)
      },
    })
    _window.myvad = myvad

    _window.toggleVAD = () => {
      if (myvad.listening === false) {
        myvad.start()
      } else {
        myvad.pause()
      }
    }
    _window.toggleVAD()
    updateDemoState(DemoState.during)
  } catch (e) {
    console.error("Failed:", e)
    if (myvad !== undefined) {
      myvad.pause()
    }
    if (myvad !== undefined) updateDemoState(DemoState.errored)
  }
}
_window.startDemo = startDemo
