import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import api from '@/lib/axios';
import { Competitor, ApiResponse } from '@/types';
import toast from 'react-hot-toast';

interface AddPointsToCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitor: Competitor | null;
  onPointsAdded: () => void; // Callback to refresh data
}

interface PointsFormInputs {
  points: number;
}

const AddPointsToCompetitorModal: React.FC<AddPointsToCompetitorModalProps> = ({
  isOpen,
  onClose,
  competitor,
  onPointsAdded,
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PointsFormInputs>();

  React.useEffect(() => {
    if (!isOpen) {
      reset({ points: undefined }); // Reset form when modal closes
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<PointsFormInputs> = async (data) => {
    if (!competitor) return;

    try {
      // API: /api/competitors/addPointsToCompetitor?id={competitorId}&points={points}
      // This API seems to be a GET request based on the query params, but adding points should ideally be POST/PUT.
      // Assuming it's a POST request for safety, adjust if it's truly GET.
      await api.post(`/competitors/addPointsToCompetitor?id=${competitor.id}&points=${data.points}`);
      toast.success(`${data.points} puan ${competitor.name} adlı yarışmacıya başarıyla eklendi.`);
      onPointsAdded(); // Call callback to refresh parent data
      onClose(); // Close this modal
    } catch (error: any) {
      console.error("Add points error:", error);
      toast.error(error.response?.data?.message || 'Puan eklenirken bir hata oluştu.');
    }
  };

  if (!competitor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${competitor.name} için Puan Ekle/Çıkar`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Mevcut Puan: <span className="font-semibold">{competitor.totalPoints}</span>
        </p>
        <Input
          label="Puan Değişikliği (+/-)" // Changed label
          id="points"
          type="number"
          {...register('points', { 
            required: 'Puan miktarı zorunludur.',
            valueAsNumber: true,
            validate: value => value !== 0 || "Puan 0'dan farklı olmalıdır."
          })}
          error={errors.points?.message}
          className="w-full"
          placeholder="Örn: 50 veya -25" // Added placeholder for clarity
        />
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="primary" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button type="submit" isLoading={isSubmitting} variant="primary">
            Puanı Güncelle
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPointsToCompetitorModal;
