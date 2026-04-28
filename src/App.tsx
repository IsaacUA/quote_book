import { useEffect, useRef, useState, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { Document, Page, pdfjs } from 'react-pdf'
import bookPdf from '/book.pdf'
import music from '/music.mp3'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfBook() {
  const bookRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [numPages, setNumPages] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const updateDimensions = useCallback(async (pdf?: any) => {
    const mobile = window.innerWidth <= 768
    setIsMobile(mobile)

    const doc = pdf || (await pdfjs.getDocument(bookPdf).promise)
    const page = await doc.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    const aspectRatio = viewport.height / viewport.width

    // 88% width on mobile to prevent any horizontal scroll "bounce"
    const canvasWidth = mobile
      ? window.innerWidth * 0.88
      : Math.min(window.innerWidth * 0.4, 500)

    setSize({
      width: Math.floor(canvasWidth),
      height: Math.floor(canvasWidth * aspectRatio),
    })
  }, [])

  const onLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages)
    updateDimensions(pdf)
  }

  useEffect(() => {
    const handleResize = () => updateDimensions()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateDimensions])

  const toggleMusic = () => {
    if (!audioRef.current) return
    isPlaying ? audioRef.current.pause() : audioRef.current.play()
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="app-container">
      <div className="book-view">
        {/* Navigation Buttons (Hidden on mobile to save space) */}
        {!isMobile && (
          <button
            className="action-btn nav-prev"
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
          >
            <span className="icon-text">{'\u2190\uFE0E'}</span>
          </button>
        )}

        <div className="flipbook-wrapper">
          <Document file={bookPdf} onLoadSuccess={onLoadSuccess}>
            {size.width > 0 && (
              <HTMLFlipBook
                key={isMobile ? 'mobile' : 'desktop'}
                ref={bookRef}
                width={size.width}
                height={size.height}
                className="flipbook"
                // --- Required IProps ---
                style={{}}
                startPage={0}
                size="fixed"
                minWidth={size.width}
                maxWidth={size.width}
                minHeight={size.height}
                maxHeight={size.height}
                drawShadow={true}
                flippingTime={1000}
                usePortrait={isMobile}
                showCover={true}
                mobileScrollSupport={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={false}
                // --- The Fix for startInPortrait ---
                {...({ startInPortrait: isMobile } as any)}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div key={i} className="page-wrapper">
                    <Page
                      pageNumber={i + 1}
                      width={size.width}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        </div>

        {!isMobile && (
          <button
            className="action-btn nav-next"
            onClick={() => bookRef.current?.pageFlip().flipNext()}
          >
            <span className="icon-text">{'\u2192\uFE0E'}</span>
          </button>
        )}
      </div>

      <audio ref={audioRef} src={music} loop />

      {/* Music Button uses the exact same 'action-btn' class */}
      <button className="action-btn music-toggle" onClick={toggleMusic}>
        <span className="icon-text">
          {isPlaying ? '\u23F8\uFE0E' : '\u25B6\uFE0E'}
        </span>
      </button>
    </div>
  )
}
