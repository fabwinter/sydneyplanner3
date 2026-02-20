'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Square, Plus, Trash2, X, Loader2 } from 'lucide-react'

export default function BulkActionBar({
  isActive,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkAdd,
  onBulkDelete,
  onCancel,
  isAdding,
  isDeleting,
  showDelete = false,
}) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[1050] bg-[#0A2540] text-white shadow-xl"
        >
          <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
              <span className="text-sm font-semibold">{selectedCount} selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={selectedCount === totalCount ? onDeselectAll : onSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors"
              >
                {selectedCount === totalCount ? (
                  <><CheckSquare className="w-3.5 h-3.5" /><span>Deselect</span></>
                ) : (
                  <><Square className="w-3.5 h-3.5" /><span>All</span></>
                )}
              </button>

              {onBulkAdd && (
                <button
                  onClick={onBulkAdd}
                  disabled={selectedCount === 0 || isAdding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00A8CC] hover:bg-[#00A8CC]/80 disabled:opacity-50 transition-colors"
                >
                  {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Add to DB</span>
                </button>
              )}

              {showDelete && onBulkDelete && (
                <button
                  onClick={onBulkDelete}
                  disabled={selectedCount === 0 || isDeleting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
