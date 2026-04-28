import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { Document, Page, pdfjs } from 'react-pdf'
import bookPdf from '/book.pdf'
import music from '/music.mp3'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function PdfBook() {
  const bookRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
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

    let canvasWidth
    let canvasHeight

    if (mobile) {
      // MOBILE: Width-first logic (Your stable phone settings)
      canvasWidth = window.innerWidth * 0.9
      canvasHeight = canvasWidth * aspectRatio
      const maxHeight = window.innerHeight - 120

      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight
        canvasWidth = canvasHeight / aspectRatio
      }
    } else {
      // DESKTOP: Bounding-box logic (Width & Height safety)
      const maxDesktopHeight = window.innerHeight * 0.75
      const maxDesktopWidth = Math.min(window.innerWidth * 0.45, 550)

      canvasWidth = maxDesktopWidth
      canvasHeight = canvasWidth * aspectRatio

      // If the book is too tall for the desktop screen, scale by height instead
      if (canvasHeight > maxDesktopHeight) {
        canvasHeight = maxDesktopHeight
        canvasWidth = canvasHeight / aspectRatio
      }
    }

    setSize({
      width: Math.floor(canvasWidth),
      height: Math.floor(canvasHeight),
    })
  }, [])

  useEffect(() => {
    const handleResize = () => updateDimensions()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateDimensions])

  const pages = useMemo(() => {
    const items = []
    for (let i = 0; i < numPages; i++) {
      const isVisible = Math.abs(i - currentPage) <= 2
      items.push(
        <div key={i} className="page-wrapper">
          {isVisible ? (
            <Page
              pageNumber={i + 1}
              width={size.width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={isMobile ? 1.2 : 2.0}
              loading={
                <div
                  style={{
                    width: size.width,
                    height: size.height,
                    background: '#fff',
                  }}
                />
              }
            />
          ) : (
            <div
              style={{
                width: size.width,
                height: size.height,
                background: '#fff',
              }}
            />
          )}
        </div>,
      )
    }
    return items
  }, [numPages, currentPage, size, isMobile])

  return (
    <div className="app-container">
      <div className="book-view">
        {!isMobile && (
          <button
            className="action-btn nav-prev"
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
          >
            <span className="icon-text">{'\u2190\uFE0E'}</span>
          </button>
        )}

        <div className="center-container">
          <div className="flipbook-wrapper">
            <Document
              file={bookPdf}
              onLoadSuccess={(pdf) => {
                setNumPages(pdf.numPages)
                updateDimensions(pdf)
              }}
            >
              {size.width > 0 && (
                <HTMLFlipBook
                  key={isMobile ? 'mobile' : 'desktop'}
                  ref={bookRef}
                  width={size.width}
                  height={size.height}
                  onFlip={(e) => setCurrentPage(e.data)}
                  startPage={0}
                  size="fixed"
                  minWidth={size.width}
                  maxWidth={size.width}
                  minHeight={size.height}
                  maxHeight={size.height}
                  drawShadow={!isMobile}
                  usePortrait={isMobile}
                  showCover={true}
                  mobileScrollSupport={false}
                  {...({
                    startInPortrait: isMobile,
                    style: { willChange: 'transform' },
                  } as any)}
                >
                  {pages}
                </HTMLFlipBook>
              )}
            </Document>
          </div>
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

      {isMobile && (
        <div className="mobile-controls">
          <button
            className="action-btn"
            onClick={() => bookRef.current?.pageFlip().flipPrev()}
          >
            <span className="icon-text">{'\u2190\uFE0E'}</span>
          </button>
          <button
            className="action-btn"
            onClick={() => {
              if (!audioRef.current) return
              isPlaying ? audioRef.current.pause() : audioRef.current.play()
              setIsPlaying(!isPlaying)
            }}
          >
            <span className="icon-text">
              {isPlaying ? '\u23F8\uFE0E' : '\u25B6\uFE0E'}
            </span>
          </button>
          <button
            className="action-btn"
            onClick={() => bookRef.current?.pageFlip().flipNext()}
          >
            <span className="icon-text">{'\u2192\uFE0E'}</span>
          </button>
        </div>
      )}

      <audio ref={audioRef} src={music} loop />

      {!isMobile && (
        <button
          className="action-btn music-toggle"
          onClick={() => {
            if (!audioRef.current) return
            isPlaying ? audioRef.current.pause() : audioRef.current.play()
            setIsPlaying(!isPlaying)
          }}
        >
          <span className="icon-text">
            {isPlaying ? '\u23F8\uFE0E' : '\u25B6\uFE0E'}
          </span>
        </button>
      )}
    </div>
  )
}
