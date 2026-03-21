import { useState, useEffect } from 'react'
import { ref, get, onValue, set, remove } from 'firebase/database'
import { db, sanitizeEmail, isOwnerEmail } from '../firebase'

export function useAccess(slug, user) {
  const [role, setRole] = useState(null)
  const [accessList, setAccessList] = useState([])
  const [loading, setLoading] = useState(true)

  const hasAccess = role !== null
  const isOwner = role === 'owner'

  useEffect(() => {
    if (!slug || !user?.email) {
      setRole(null)
      setLoading(false)
      return
    }

    const accessRef = ref(db, `trips/${slug}/access`)
    const unsub = onValue(accessRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setRole(null)
        setAccessList([])
        setLoading(false)
        return
      }

      const sanitized = sanitizeEmail(user.email)
      const userAccess = data[sanitized]
      setRole(userAccess?.role || null)

      const list = Object.entries(data).map(([key, val]) => ({
        email: key.replace(/_/g, '.'),
        ...val,
      }))
      setAccessList(list)
      setLoading(false)
    })

    return () => unsub()
  }, [slug, user?.email])

  const addAccess = async (email, name, accessRole = 'viewer') => {
    const sanitized = sanitizeEmail(email)
    await set(ref(db, `trips/${slug}/access/${sanitized}`), { role: accessRole, name })
  }

  const removeAccess = async (email) => {
    if (isOwnerEmail(email)) return
    const sanitized = sanitizeEmail(email)
    await remove(ref(db, `trips/${slug}/access/${sanitized}`))
  }

  return { role, hasAccess, isOwner, accessList, loading, addAccess, removeAccess }
}
