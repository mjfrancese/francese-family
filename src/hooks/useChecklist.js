import { useState, useEffect, useCallback } from 'react'
import { ref, onValue, update } from 'firebase/database'
import { db } from '../firebase'

export function useChecklist(slug) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const checkRef = ref(db, `trips/${slug}/checklist`)
    const unsub = onValue(checkRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setItems([])
        setLoading(false)
        return
      }

      const list = Object.entries(data)
        .map(([id, item]) => ({ id, ...item }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      setItems(list)
      setLoading(false)
    })

    return () => unsub()
  }, [slug])

  const toggle = useCallback((id) => {
    if (!slug) return
    const item = items.find(i => i.id === id)
    if (!item) return
    const itemRef = ref(db, `trips/${slug}/checklist/${id}`)
    update(itemRef, { done: !item.done })
  }, [slug, items])

  return { items, loading, toggle }
}
