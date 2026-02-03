import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-urbik-rose/10 rounded-full">
            <span className="text-urbik-rose text-xl font-bold">!</span>
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-urbik-black/70 hover:border-urbik-white rounded-full hover:bg-urbik-black/70 hover:text-urbik-white disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 cursor-pointer px-4 py-2 text-sm font-medium border border-urbik-white text-white bg-urbik-rose rounded-full hover:bg-urbik-white hover:text-urbik-rose hover:border-urbik-rose disabled:opacity-50 flex justify-center items-center"
          >
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}