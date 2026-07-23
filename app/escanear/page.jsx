'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import jsQR from 'jsqr'
import { IconQrCode, IconAlertTriangle } from '../components/Icons'

export default function EscanearQR() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const router = useRouter()
  const [estado, setEstado] = useState('iniciando') // iniciando | activo | denegado | encontrado
  const [manual, setManual] = useState('')

  const detener = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  const irAEquipo = useCallback((texto) => {
    detener()
    setEstado('encontrado')
    try {
      const url = new URL(texto, window.location.href)
      if (url.origin === window.location.origin) {
        router.push(url.pathname)
        return
      }
    } catch {
      // el texto leído no era una URL, seguimos con el fallback de abajo
    }
    window.location.href = texto
  }, [detener, router])

  useEffect(() => {
    let activo = true

    function escanear() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(escanear)
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const codigo = jsQR(imageData.data, imageData.width, imageData.height)
      if (codigo?.data) {
        irAEquipo(codigo.data)
        return
      }
      rafRef.current = requestAnimationFrame(escanear)
    }

    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (!activo) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setEstado('activo')
        escanear()
      } catch (e) {
        console.error('Error accediendo a la cámara:', e)
        setEstado('denegado')
      }
    }

    iniciar()
    return () => {
      activo = false
      detener()
    }
  }, [detener, irAEquipo])

  function buscarManual(e) {
    e.preventDefault()
    if (manual.trim()) irAEquipo(manual.trim())
  }

  return (
    <main className="max-w-2xl mx-auto p-4 sm:p-8 w-full">
      <div className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'var(--font-display)' }}>Escanear QR</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Apunta la cámara al código QR de un equipo para abrir su hoja de vida al instante.</p>
      </div>

      <div className="card overflow-hidden animate-fade-up" style={{ animationDelay: '0.05s' }}>
        <div className="relative aspect-square bg-slate-900">
          <video ref={videoRef} playsInline muted className={`h-full w-full object-cover ${estado === 'activo' ? 'opacity-100' : 'opacity-0'}`} />
          <canvas ref={canvasRef} className="hidden" />

          {estado === 'activo' && (
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/70" />
          )}

          {estado === 'iniciando' && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-white/70 text-sm">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Activando cámara...
            </div>
          )}

          {estado === 'denegado' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 px-8 text-white">
              <IconAlertTriangle className="h-6 w-6 text-amber-400" />
              <p className="text-sm">No se pudo acceder a la cámara. Revisa los permisos del navegador o usa la búsqueda manual de abajo.</p>
            </div>
          )}

          {estado === 'encontrado' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-2 text-white bg-emerald-600/90">
              <IconQrCode className="h-6 w-6" />
              <p className="text-sm font-medium">Código detectado, abriendo hoja de vida...</p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5 mt-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <p className="label-field mb-2">¿No tienes cámara a mano?</p>
        <form onSubmit={buscarManual} className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Pega aquí el enlace del código QR"
            className="input-field"
          />
          <button type="submit" className="btn btn-primary btn-md shrink-0">Ir</button>
        </form>
      </div>
    </main>
  )
}
