import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../types';

interface ToastProps {
  toast: ToastType | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed top-6 right-6 z-50 flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border backdrop-blur-md max-w-md"
          style={{
            backgroundColor: 
              toast.type === 'success' ? 'rgba(34, 197, 94, 0.1)' :
              toast.type === 'error' ? 'rgba(239, 68, 68, 0.1)' :
              toast.type === 'warning' ? 'rgba(250, 204, 21, 0.1)' :
              'rgba(79, 140, 255, 0.1)',
            borderColor:
              toast.type === 'success' ? '#22c55e' :
              toast.type === 'error' ? '#ef4444' :
              toast.type === 'warning' ? '#facc15' :
              '#4f8cff',
            color: '#ffffff',
            boxShadow: 
              toast.type === 'success' ? '0 0 15px rgba(34, 197, 94, 0.15)' :
              toast.type === 'error' ? '0 0 15px rgba(239, 68, 68, 0.15)' :
              toast.type === 'warning' ? '0 0 15px rgba(250, 204, 21, 0.15)' :
              '0 0 15px rgba(79, 140, 255, 0.15)'
          }}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle className="w-5.5 h-5.5 text-[#22c55e]" />}
            {toast.type === 'error' && <XCircle className="w-5.5 h-5.5 text-[#ef4444]" />}
            {toast.type === 'warning' && <AlertCircle className="w-5.5 h-5.5 text-[#facc15]" />}
            {toast.type === 'info' && <Info className="w-5.5 h-5.5 text-[#4f8cff]" />}
          </div>
          <div className="flex-1 font-sans text-xs font-semibold leading-relaxed tracking-wide">
            {toast.message}
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-150 shrink-0"
          >
            <X className="w-4 h-4 opacity-60 hover:opacity-100 text-white" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
