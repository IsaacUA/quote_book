import { useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { Document, Page, pdfjs } from 'react-pdf'
import bookPdf from '/book.pdf'
import music from '/music.mp3'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export default function PdfBook() {
  const bookRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [numPages, setNumPages] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [size, setSize] = useState({ width: 600, height: 800 })

  const onLoad = async (pdf: any) => {
    setNumPages(pdf.numPages)

    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1 })

    const scale = Math.min(
      (window.innerWidth * 0.8) / viewport.width,
      (window.innerHeight * 0.9) / viewport.height,
    )

    setSize({
      width: viewport.width * scale,
      height: viewport.height * scale,
    })
  }

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
    <>
      <div className="book-wrapper">
        <button
          className="btn"
          onClick={() => bookRef.current?.pageFlip().flipPrev()}
        >
          ←
        </button>

        <Document file={bookPdf} onLoadSuccess={onLoad}>
          <HTMLFlipBook
            ref={bookRef}
            width={size.width}
            height={size.height}
            size="fixed"
            showCover={true}
            className="flipbook"
            mobileScrollSupport={true}
            /* REQUIRED by TypeScript */
            style={{}}
            startPage={0}
            minWidth={250}
            maxWidth={1200}
            minHeight={300}
            maxHeight={1600}
            maxShadowOpacity={0.5}
            drawShadow={true}
            flippingTime={1000}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <div key={i} className="page">
                <Page
                  pageNumber={i + 1}
                  width={size.width}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </div>
            ))}
          </HTMLFlipBook>
        </Document>

        <button
          className="btn"
          onClick={() => bookRef.current?.pageFlip().flipNext()}
        >
          →
        </button>
      </div>

      {/* 🎵 background music */}
      <audio ref={audioRef} src={music} loop />

      <button className="btn music-btn" onClick={toggleMusic}>
        {isPlaying ? '⏸' : '▶'}
      </button>
    </>
  )
}
