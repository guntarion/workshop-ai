import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EmailStatus } from '../types';

interface EmailButtonProps {
  show: boolean;
  status: EmailStatus;
  userEmail?: string | null;
  onSend: () => void;
}

export function EmailButton({ show, status, userEmail, onSend }: EmailButtonProps) {
  if (!show) return null;

  return (
    <>
      <Button
        onClick={onSend}
        disabled={status.loading}
        className={`
          ${status.loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
          ${status.success ? 'bg-green-600' : ''} 
          text-white px-4 py-2 rounded
        `}
      >
        {status.loading 
          ? 'Mengirim...' 
          : status.success 
            ? 'Terkirim!' 
            : 'Kirim ke Email'}
      </Button>

      {status.error && (
        <Alert className="bg-red-50 text-red-800 mb-4">
          <AlertDescription>{status.error}</AlertDescription>
        </Alert>
      )}

      {status.success && (
        <Alert className="bg-green-50 text-green-800 mb-4">
          <AlertDescription>
            Email berhasil dikirim ke {userEmail}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}