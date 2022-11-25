import "./main.css"
import Alpine from "alpinejs"
import * as vad from "@ricky0123/vad"
let windowAny = window as any
windowAny.Alpine = Alpine
Alpine.start()

async function startDemo() {
  console.log("starting demo...")
  try {
    const myvad = await vad.MicVAD.new({
      positiveSpeechThreshold: 0.8,
      minSpeechFrames: 5,
      preSpeechPadFrames: 10,
      onFrameProcessed: (probs) => {},
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
    console.log("loaded vad")
    windowAny.myvad = myvad

    windowAny.toggleVAD = () => {
      console.log("ran toggle vad")
      if (myvad.listening === false) {
        myvad.start()
      } else {
        myvad.pause()
      }
    }
    windowAny.toggleVAD()
  } catch (e) {
    console.error("Failed:", e)
  }
}
windowAny.startDemo = startDemo
