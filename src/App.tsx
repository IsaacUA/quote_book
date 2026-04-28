import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import bookPdf from '/book.pdf'
import music from '/music.mp3'

// Initialize the PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function VerticalPdfApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [width, setWidth] = useState(window.innerWidth)

  // Handle responsive scaling
  useEffect(() => {
    const handleResize = () => {
      const newWidth =
        window.innerWidth <= 768
          ? window.innerWidth * 0.95
          : Math.min(window.innerWidth * 0.8, 800)
      setWidth(newWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="vertical-app">
      <div className="pdf-viewport">
        <Document
          file={bookPdf}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="custom-loader">Preparing book...</div>}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <div key={`page_${index + 1}`} className="pdf-page-card">
              <Page
                pageNumber={index + 1}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                scale={1.5}
                loading={
                  <div
                    className="page-skeleton"
                    style={{ width, height: '600px' }}
                  />
                }
              />
            </div>
          ))}
        </Document>
      </div>

      <audio ref={audioRef} src={music} loop />

      <button className="music-toggle-btn" onClick={toggleMusic}>
        {isPlaying ? 'Stop Music' : 'Play Music'}
      </button>
    </div>
  )
}
