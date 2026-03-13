import { useMemo } from 'react'

function generateId() {
  return 'v_' + crypto.randomUUID()
}

export default function useVisitorId() {
  const visitorId = useMemo(() => {
    let id = sessionStorage.getItem('converthub_visitor_id')
    if (!id) {
      id = generateId()
      sessionStorage.setItem('converthub_visitor_id', id)
    }
    return id
  }, [])

  return visitorId
}

export function getVisitorId() {
  let id = sessionStorage.getItem('converthub_visitor_id')
  if (!id) {
    id = generateId()
    sessionStorage.setItem('converthub_visitor_id', id)
  }
  return id
}
