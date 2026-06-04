"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ToastCtx { show: (msg: string, err?: boolean) => void; }
const Ctx = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ msg: string; err: boolean; visible: boolean }>({
    msg: "", err: false, visible: false,
  });

  const show = useCallback((msg: string, err = false) => {
    setState({ msg, err, visible: true });
    setTimeout(() => setState(s => ({ ...s, visible: false })), 2500);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-white text-[13px] font-medium shadow-2xl z-[9999] pointer-events-none transition-all duration-[250ms] ${
          state.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        } ${state.err ? "bg-vermelho" : "bg-[#1a1f36]"}`}
      >
        {state.msg}
      </div>
    </Ctx.Provider>
  );
}
