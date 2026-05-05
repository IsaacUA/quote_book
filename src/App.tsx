import { useState, useRef, useEffect } from 'react'
import './App.css'
import data from './data/data.json'
import background_main from './assets/background_main.jpeg'
import background_playlist from './assets/background_playlist.jpeg'
import background_messages from './assets/background_messages.jpeg'
type Message = {
  id: number
  from: string
  avatar: string
  thread: string[]
}

export default function App() {
  const [screen, setScreen] = useState<'home' | 'music' | 'messages'>('home')
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentTrack, setCurrentTrack] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // --- PRELOAD LOGIC ---
  useEffect(() => {
    const images = [
      background_main,
      background_playlist,
      background_messages,
      ...data.messages.map((m) => m.avatar),
    ]

    let loadedCount = 0
    images.forEach((src) => {
      const img = new Image()
      img.decoding = 'async'
      img.loading = 'eager'
      img.src = src
      img.onload = () => {
        loadedCount++
        setLoadProgress(Math.floor((loadedCount / images.length) * 100))
        if (loadedCount === images.length) {
          // Small delay so the user can actually see the cool loading bar
          setTimeout(() => setIsLoading(false), 1500)
        }
      }
      img.onerror = () => {
        loadedCount++ // Count even if it fails to avoid getting stuck
        if (loadedCount === images.length) setIsLoading(false)
      }
    })
  }, [])

  const toggleTrack = (track: any) => {
    const audio = audioRef.current
    if (!audio) return
    if (currentTrack === track.id) {
      isPlaying ? audio.pause() : audio.play()
      setIsPlaying(!isPlaying)
      return
    }
    audio.src = `./music/music_${track.id}.mp3`
    audio.play()
    setCurrentTrack(track.id)
    setIsPlaying(true)
  }

  // --- LOADING SCREEN ---
  if (isLoading) {
    return (
      <div className="p5-stage">
        <div className="loading-container">
          <div className="loading-text">ЗАГАРБАЙ СВОЄ ЗАВТРА...</div>
          <div className="loading-bar-rail">
            <div
              className="loading-bar-fill"
              style={{ width: `${loadProgress}%` }}
            ></div>
          </div>
          <div className="loading-percent">{loadProgress}%</div>
        </div>
      </div>
    )
  }

  const renderScreen = () => {
    if (screen === 'music') {
      return (
        <div className="content p5-panel music-container">
          <h1 className="jagged-header">МʼЮЗІК</h1>
          <div className="music-list scrollable">
            {data.music.map((track) => (
              <div key={track.id} className="track-card">
                <div className="track-info">
                  <div className="track-title">{track.title}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
                <button
                  className={`p5-control-btn ${currentTrack === track.id && isPlaying ? 'is-playing' : ''}`}
                  onClick={() => toggleTrack(track)}
                >
                  <div className="p5-icon-container">
                    <div className="p5-icon-shape"></div>
                  </div>
                  <span className="p5-btn-text">
                    {currentTrack === track.id && isPlaying ? 'STOP' : 'PLAY'}
                  </span>
                </button>
              </div>
            ))}
          </div>
          <button className="back-btn" onClick={() => setScreen('home')}>
            НАЗАД
          </button>
        </div>
      )
    }

    if (screen === 'messages') {
      return selectedMessage ? (
        <div className="content p5-panel messages-container">
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
            НАЗАД
          </button>
        </div>
      ) : (
        <div className="content p5-panel messages-container">
          <h1 className="jagged-header">ЦИТАТИ</h1>
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
            НАЗАД
          </button>
        </div>
      )
    }

    return (
      <div className="home-container">
        <div className="persona-logo-container">
          <div className="logo-box box-1">Тисячоликий</div>
          <div className="logo-box box-2">Герой</div>
        </div>
        <div className="menu-vertical">
          <button className="menu-btn" onClick={() => setScreen('music')}>
            МʼЮЗІК
          </button>
          <button className="menu-btn" onClick={() => setScreen('messages')}>
            ЦИТАТИ
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
