import { useState, useCallback } from 'react'
import { getVisitorId } from './useVisitorId'

export default function useConverter(endpoint) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const convert = useCallback(async (formData) => {
    setLoading(true)
    setProgress(0)
    setError(null)
    setResult(null)

    try {
      const xhr = new XMLHttpRequest()

      const promise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 90))
          }
        }

        xhr.onload = () => {
          setProgress(100)
          const contentType = xhr.getResponseHeader('Content-Type') || ''
          if (xhr.status >= 200 && xhr.status < 300) {
            if (contentType.includes('application/json')) {
              try {
                const text = new TextDecoder().decode(xhr.response)
                resolve(JSON.parse(text))
              } catch {
                resolve(xhr.response)
              }
            } else {
              const blob = new Blob([xhr.response], { type: contentType })
              const url = URL.createObjectURL(blob)
              const disposition = xhr.getResponseHeader('Content-Disposition')
              let filename = 'download'
              if (disposition) {
                const match = disposition.match(/filename="?(.+?)"?$/i)
                if (match) filename = match[1]
              }
              resolve({ url, filename, blob })
            }
          } else {
            let errMsg = 'Erro na conversão'
            try {
              const text = new TextDecoder().decode(xhr.response)
              const parsed = JSON.parse(text)
              errMsg = parsed.error || errMsg
            } catch {}
            reject(new Error(errMsg))
          }
        }

        xhr.onerror = () => reject(new Error('Erro de rede'))
        xhr.ontimeout = () => reject(new Error('Tempo esgotado'))
      })

      xhr.open('POST', endpoint)
      xhr.setRequestHeader('x-visitor-id', getVisitorId())
      xhr.responseType = 'arraybuffer'
      xhr.timeout = 120000
      xhr.send(formData)

      const res = await promise
      setResult(res)
      return res
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  const reset = useCallback(() => {
    setLoading(false)
    setProgress(0)
    setError(null)
    setResult(null)
  }, [])

  return { convert, loading, progress, error, result, reset }
}
