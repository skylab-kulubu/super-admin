import React, { useEffect, useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import api from '@/lib/axios';
// Removed Competitor, CompetitorId from import as allCompetitors is removed
import { Season, AddSeasonPayload, UpdateSeasonPayload, ApiResponse, SeasonId } from '@/types';
import toast from 'react-hot-toast';
import { parseApiTimestampToYyyyMmDd, formatDateToYyyyMmDd, formatDateToDdMmYyyy } from '@/lib/utils'; // IMPORTANT: Updated/Verified utility functions

interface AddEditAgcSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeasonSaved: () => void;
  seasonToEdit?: Season | null;
  // allCompetitors prop is removed
}

interface SeasonFormInputs {
  name: string;
  startDate: string; // HTML input format: yyyy-MM-dd
  endDate: string;   // HTML input format: yyyy-MM-dd
  isActive: boolean;
  // competitorIds are handled separately for new seasons
}

const AddEditAgcSeasonModal: React.FC<AddEditAgcSeasonModalProps> = ({
  isOpen,
  onClose,
  onSeasonSaved,
  seasonToEdit,
  // allCompetitors, // Prop removed
}) => {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<SeasonFormInputs>();
  // const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<CompetitorId[]>([]); // State removed

  useEffect(() => {
    if (isOpen) {
      if (seasonToEdit) {
        reset({
          name: seasonToEdit.name,
          startDate: seasonToEdit.startDate ? parseApiTimestampToYyyyMmDd(seasonToEdit.startDate) : '',
          endDate: seasonToEdit.endDate ? parseApiTimestampToYyyyMmDd(seasonToEdit.endDate) : '',
          isActive: seasonToEdit.isActive,
        });
      } else {
        reset({
          name: '',
          startDate: '',
          endDate: '',
          isActive: true,
        });
      }
      // setSelectedCompetitorIds([]); // State removed
    }
  }, [seasonToEdit, isOpen, reset]);

  // handleCompetitorSelection function is removed
  /*
  const handleCompetitorSelection = (competitorId: CompetitorId) => {
    setSelectedCompetitorIds(prev =>
      prev.includes(competitorId) ? prev.filter(id => id !== competitorId) : [...prev, competitorId]
    );
  };
  */

  const onSubmit: SubmitHandler<SeasonFormInputs> = async (data) => {
    try {
      if (seasonToEdit) {
        const updatePayload: UpdateSeasonPayload = {
          id: seasonToEdit.id,
          name: data.name,
          startDate: formatDateToDdMmYyyy(data.startDate), // API expects dd-MM-yyyy
          endDate: formatDateToDdMmYyyy(data.endDate),     // API expects dd-MM-yyyy
          isActive: data.isActive,
        };
        await api.put(`/seasons/updateSeason`, updatePayload); // Assuming PUT /seasons/updateSeason endpoint
        toast.success('Sezon başarıyla güncellendi.');
      } else {
        const addPayload: AddSeasonPayload = {
          name: data.name,
          startDate: formatDateToDdMmYyyy(data.startDate),
          endDate: formatDateToDdMmYyyy(data.endDate),
          isActive: data.isActive,
          tenant: "AGC",
          competitorIds: [], // Set to empty array as UI for selection is removed
        };
        await api.post<ApiResponse<SeasonId>>('/seasons/addSeason', addPayload);
        toast.success('Sezon başarıyla eklendi. Yarışmacıları sezon detay sayfasından ekleyebilirsiniz.');
      }
      onSeasonSaved();
      onClose();
    } catch (error: any) {
      console.error("Save season error:", error);
      toast.error(error.response?.data?.message || 'Sezon kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={seasonToEdit ? 'Sezonu Düzenle' : 'Yeni Sezon Ekle'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
        <Input
          label="Sezon Adı"
          id="seasonName"
          {...register('name', { required: 'Sezon adı zorunludur.' })}
          error={errors.name?.message}
          className="w-full"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Başlangıç Tarihi"
            id="startDate"
            type="date"
            {...register('startDate', { required: 'Başlangıç tarihi zorunludur.' })}
            error={errors.startDate?.message}
            className="w-full"
          />
          <Input
            label="Bitiş Tarihi"
            id="endDate"
            type="date"
            {...register('endDate', { 
              required: 'Bitiş tarihi zorunludur.',
              validate: (value, formValues) => new Date(value) > new Date(formValues.startDate) || 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.'
            })}
            error={errors.endDate?.message}
            className="w-full"
          />
        </div>
        <Controller
          name="isActive"
          control={control}
          defaultValue={true}
          render={({ field }) => (
            <Checkbox
              label="Aktif Sezon"
              id="isActiveSeason"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />

        {/* Section for selecting initial competitors is removed */}
        {/* {!seasonToEdit && ( ... )} */}

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="primary" onClick={onClose} disabled={isSubmitting}>
            İptal
          </Button>
          <Button type="submit" isLoading={isSubmitting} variant="primary">
            {seasonToEdit ? 'Değişiklikleri Kaydet' : 'Sezon Oluştur'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditAgcSeasonModal;
