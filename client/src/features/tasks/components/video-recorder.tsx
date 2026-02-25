import { useState, useRef, useEffect, useCallback } from 'react'
import { Video, Square, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoRecorderProps {
  onRecorded: (blob: Blob | null) => void
}

export function VideoRecorder({ onRecorded }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop())
    if (videoUrl) URL.revokeObjectURL(videoUrl)
  }, [videoUrl])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = stream

      // Show live preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play()
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        onRecorded(blob)
        stream.getTracks().forEach((t) => t.stop())
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } catch {
      // Camera/mic permission denied or not available
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const deleteRecording = () => {
    cleanup()
    setVideoUrl(null)
    setDuration(0)
    onRecorded(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (videoUrl) {
    return (
      <div className='space-y-2 rounded-lg border bg-muted/30 p-3'>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={videoUrl} controls className='max-h-48 w-full rounded-md' />
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={deleteRecording}
          className='gap-x-1 text-destructive'
        >
          <Trash2 className='h-4 w-4' />
          Remove Video
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {isRecording && (
        <div className='overflow-hidden rounded-lg border'>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoPreviewRef}
            muted
            className='max-h-48 w-full bg-black'
          />
        </div>
      )}
      <div className='flex items-center gap-3'>
        {isRecording ? (
          <>
            <div className='flex items-center gap-2'>
              <span className='h-3 w-3 animate-pulse rounded-full bg-red-500' />
              <span className='text-sm font-medium text-red-600'>
                Recording {formatTime(duration)}
              </span>
            </div>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={stopRecording}
              className='gap-x-1'
            >
              <Square className='h-3 w-3' />
              Stop
            </Button>
          </>
        ) : (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={startRecording}
            className='gap-x-2'
          >
            <Video className='h-4 w-4' />
            Record Video Note
          </Button>
        )}
      </div>
    </div>
  )
}
