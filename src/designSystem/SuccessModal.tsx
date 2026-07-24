import { CheckCircle } from 'lucide-react';
import { Modal } from './ui/modal';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'تم بنجاح',
  message,
  details,
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
          <CheckCircle className="w-7 h-7 text-green-700" />
        </div>
        <p className="text-base font-semibold text-text-strong">{message}</p>
        {details ? <p className="text-sm text-text-sub">{details}</p> : null}
        <button
          onClick={onClose}
          className="mt-2 px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          حسناً
        </button>
      </div>
    </Modal>
  );
}

