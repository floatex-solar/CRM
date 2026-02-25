import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Play, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceRecorderProps {
  onRecorded: (blob: Blob | null) => void
}

export function VoiceRecorder({ onRecorded }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
  }, [audioUrl])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecorded(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } catch {
      // Microphone permission denied or not available
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const deleteRecording = () => {
    cleanup()
    setAudioUrl(null)
    setDuration(0)
    onRecorded(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (audioUrl) {
    return (
      <div className='flex items-center gap-3 rounded-lg border bg-muted/30 p-3'>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio src={audioUrl} controls className='h-8 flex-1' />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={deleteRecording}
          className='h-8 w-8 text-destructive'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  return (
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
          <Mic className='h-4 w-4' />
          Record Voice Note
        </Button>
      )}
    </div>
  )
}
