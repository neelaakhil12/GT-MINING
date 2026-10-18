import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-21 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:top-auto md:bottom-8 md:right-8 z-50 flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-2.5 rounded-2xl border backdrop-blur-2xl shadow-[0_12px_36px_rgba(0,0,0,0.25)] transition-all duration-300 animate-in slide-in-from-top-3 md:slide-in-from-right ${
              toast.type === 'success'
                ? 'bg-[#0B2515]/95 border-[#22C55E]/50 text-[#F0FDF4]'
                : toast.type === 'error'
                ? 'bg-[#2A0D0D]/95 border-[#F87171]/50 text-[#FEE2E2]'
                : 'bg-[#071F15]/95 border-[#86EFAC]/30 text-[#F0FDF4]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#4ADE80] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#F87171] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#86EFAC] shrink-0 mt-0.5" />}
            
            <p className="text-sm flex-1 font-medium leading-relaxed">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#A7C9B1] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
