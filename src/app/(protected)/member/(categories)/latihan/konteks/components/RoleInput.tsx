import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface RoleInputProps {
  role: string;
  onChange: (value: string) => void;
}

export function RoleInput({ role, onChange }: RoleInputProps) {
  return (
    <Card className='p-6'>
      <h2 className='text-xl font-semibold mb-4'>Identifikasi Peran Anda</h2>
      <div className='space-y-2'>
        <p className='text-sm text-gray-600'>
          Tentukan peran atau posisi Anda untuk memberikan konteks pada instruksi yang akan dibuat
        </p>
        <Input
          placeholder='Contoh: Supervisor Pemeliharaan, Operator Pembangkit, dsb.'
          value={role}
          onChange={(e) => onChange(e.target.value)}
          className='w-full'
        />
      </div>
    </Card>
  );
}