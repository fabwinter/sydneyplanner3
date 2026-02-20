'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Save } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { authFetch } from '@/lib/api'

const FIELDS = [
  { label: 'Name *', field: 'name', placeholder: 'Venue name' },
  { label: 'Category *', field: 'category', placeholder: 'e.g. Cafe, Restaurant, Beach' },
  { label: 'Address', field: 'address', placeholder: 'Street address' },
  { label: 'Latitude', field: 'lat', placeholder: '-33.8688' },
  { label: 'Longitude', field: 'lng', placeholder: '151.2093' },
  { label: 'Rating (0-5)', field: 'rating', placeholder: '4.5' },
  { label: 'Description', field: 'description', placeholder: 'Brief description...' },
  { label: 'Image URL', field: 'image', placeholder: 'https://...' },
]

const VenueEditModal = ({ venue, isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', category: '', address: '', lat: '', lng: '',
    rating: '', description: '', image: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (venue) {
      setForm({
        name: venue.name || '',
        category: venue.category || '',
        address: venue.address || '',
        lat: venue.lat?.toString() || '',
        lng: venue.lng?.toString() || '',
        rating: venue.rating?.toString() || '',
        description: venue.description || '',
        image: venue.image || '',
      })
    }
  }, [venue])

  if (!isOpen || !venue) return null

  // venue.added_by exists = it's already in Supabase; otherwise save new
  const isSaveNew = !venue.added_by
  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error('Name and category are required')
      return
    }
    setIsSubmitting(true)
    try {
      // Supabase venues table schema uses snake_case and string rating
      const payload = {
        name: form.name,
        category: form.category,
        address: form.address,
        lat: parseFloat(form.lat) || 0,
        lng: parseFloat(form.lng) || 0,
        rating: form.rating || '0',
        description: form.description,
        image: form.image,
        ...(venue.fsqId ? { fsq_id: venue.fsqId } : {}),
        is_foursquare: !!venue.isFoursquare,
      }

      const url = isSaveNew ? '/api/venues/saved' : `/api/venues/saved/${venue.id}`
      const method = isSaveNew ? 'POST' : 'PATCH'

      const response = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(isSaveNew ? 'Venue saved to database!' : 'Venue updated!')
        onSave(isSaveNew ? (Array.isArray(data.venues) ? data.venues[0] : data.venue) : data.venue)
        onClose()
      } else {
        toast.error(data.error || 'Failed to save venue')
      }
    } catch (err) {
      console.error('Save venue error:', err)
      toast.error('Failed to save venue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[4500]"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-[4501] max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">
                  GOD MODE
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {isSaveNew ? 'Save Venue to DB' : 'Edit Venue'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-4 space-y-3">
              {FIELDS.map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {label}
                  </label>
                  <Input
                    value={form[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    placeholder={placeholder}
                    className="h-10 text-sm"
                  />
                </div>
              ))}
              {form.image && (
                <div className="rounded-xl overflow-hidden h-32 mt-2">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 safe-bottom">
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-purple-600 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><Save className="w-4 h-4" /><span>{isSaveNew ? 'Save to Database' : 'Update Venue'}</span></>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default VenueEditModal
