import { useState, useRef } from 'react'
import './App.css'
import data from './data/data.json'
type Message = {
  id: number
  from: string
  avatar: string
  thread: string[]
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'music' | 'messages'>('home')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleTrack = (track: any) => {
    const audio = audioRef.current
    if (!audio) return
    if (currentTrack === track.id) {
      isPlaying ? audio.pause() : audio.play()
      setIsPlaying(!isPlaying)
      return
    }
    audio.src = `./music/${track.id}.mp3`
    audio.play()
    setCurrentTrack(track.id)
    setIsPlaying(true)
  }

  const renderScreen = () => {
    if (screen === 'music') {
      return (
        <div className="content p5-panel">
          <h1 className="jagged-header">PLAYLIST</h1>
          <div className="music-list scrollable">
            {data.music.map((track) => (
              <div key={track.id} className="track-card">
                <div className="track-info">
                  <div className="track-title">{track.title}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
                <button
                  className="p5-btn-small"
                  onClick={() => toggleTrack(track)}
                >
                  {currentTrack === track.id && isPlaying ? 'STOP' : 'PLAY'}
                </button>
              </div>
            ))}
          </div>
          <button className="back-btn" onClick={() => setScreen('home')}>
            RETURN
          </button>
        </div>
      )
    }

    if (screen === 'messages') {
      return selectedMessage ? (
        <div className="content p5-panel">
          <h1 className="jagged-header">{selectedMessage.from}</h1>
          <div className="thread-list scrollable">
            {selectedMessage.thread.map((msg, i) => (
              <div
                key={i}
                className={`message-row ${i % 2 === 0 ? 'row-left' : 'row-right'}`}
              >
                <div className="avatar-frame">
                  <img src={selectedMessage.avatar} alt="face" />
                </div>
                <div className="message-bubble-p5">{msg}</div>
              </div>
            ))}
          </div>
          <button className="back-btn" onClick={() => setSelectedMessage(null)}>
            BACK
          </button>
        </div>
      ) : (
        <div className="content p5-panel">
          <h1 className="jagged-header">MESSAGES</h1>
          <div className="message-list scrollable">
            {data.messages.map((msg) => (
              <button
                key={msg.id}
                className="p5-list-item"
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="list-avatar-crop">
                  <img src={msg.avatar} alt="" />
                </div>
                <span>{msg.from}</span>
              </button>
            ))}
          </div>
          <button className="back-btn" onClick={() => setScreen('home')}>
            HOME
          </button>
        </div>
      )
    }

    return (
      <div className="home-container">
        <div className="persona-logo-container">
          <div className="logo-box box-1">PHANTOM</div>
          <div className="logo-box box-2">PAST</div>
        </div>
        <div className="menu-vertical">
          <button className="menu-btn" onClick={() => setScreen('music')}>
            MUSIC
          </button>
          <button className="menu-btn" onClick={() => setScreen('messages')}>
            MESSAGES
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p5-stage">
      <audio ref={audioRef} />
      <div className="phone-tilt-wrapper">
        <div className={`phone-frame ${screen}`}>
          <div className="scanline-overlay" />
          {renderScreen()}
        </div>
      </div>
    </div>
  )
}
