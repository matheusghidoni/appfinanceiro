"use client";

import Modal from "./Modal";

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel} width="380px">
      <h3 className="text-base font-bold text-heading mb-3">{title}</h3>
      <p className="text-[13px] text-muted leading-relaxed mb-4">{message}</p>
      <div className="flex gap-2.5 justify-end">
        <button
          onClick={onCancel}
          className="border-[1.5px] border-border bg-none rounded-lg px-4 py-2 text-[13px] font-sans cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="bg-vermelho text-white border-none rounded-lg px-4 py-2 text-[13px] font-sans cursor-pointer"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
}
