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
          className="fixed top-6 right-6 z-50 flex items-center gap-3.5 px-4.5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-md max-w-md"
          style={{
            backgroundColor: 
              toast.type === 'success' ? 'rgba(240, 253, 250, 0.95)' :
              toast.type === 'error' ? 'rgba(255, 241, 242, 0.95)' :
              toast.type === 'warning' ? 'rgba(255, 251, 235, 0.95)' :
              'rgba(240, 249, 255, 0.95)',
            borderColor:
              toast.type === 'success' ? '#99f6e4' :
              toast.type === 'error' ? '#fecdd3' :
              toast.type === 'warning' ? '#fde68a' :
              '#bae6fd',
            color:
              toast.type === 'success' ? '#0f766e' :
              toast.type === 'error' ? '#9f1239' :
              toast.type === 'warning' ? '#92400e' :
              '#075985',
          }}
        >
          <div className="shrink-0">
            {toast.type === 'success' && <CheckCircle className="w-5.5 h-5.5 text-teal-600" />}
            {toast.type === 'error' && <XCircle className="w-5.5 h-5.5 text-rose-600" />}
            {toast.type === 'warning' && <AlertCircle className="w-5.5 h-5.5 text-amber-600" />}
            {toast.type === 'info' && <Info className="w-5.5 h-5.5 text-sky-600" />}
          </div>
          <div className="flex-1 font-sans text-xs font-semibold leading-relaxed tracking-wide">
            {toast.message}
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-black/5 transition-colors duration-150 shrink-0"
          >
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
