import React, { useState, useEffect, useCallback } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select'; // Assuming a Select component exists
import api from '@/lib/axios';
import { Season, Competitor, CompetitorId, ApiResponse } from '@/types';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon, CurrencyDollarIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import AddPointsToCompetitorModal from './AddPointsToCompetitorModal';

interface ManageSeasonCompetitorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: Season | null;
  allCompetitors: Competitor[]; // All available competitors in the system
  onCompetitorsUpdated: () => void;
}

const ManageSeasonCompetitorsModal: React.FC<ManageSeasonCompetitorsModalProps> = ({
  isOpen,
  onClose,
  season,
  allCompetitors,
  onCompetitorsUpdated,
}) => {
  // Use a local copy of season's competitors to reflect optimistic updates or allow cancellation
  const [currentSeasonCompetitors, setCurrentSeasonCompetitors] = useState<Competitor[]>([]);
  const [competitorToAdd, setCompetitorToAdd] = useState<CompetitorId | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false); // General submitting state

  const [isAddPointsModalOpen, setIsAddPointsModalOpen] = useState(false);
  const [competitorForPoints, setCompetitorForPoints] = useState<Competitor | null>(null);

  useEffect(() => {
    if (season && isOpen) {
      // Fetch the season details again to get the most up-to-date competitor list
      // Or rely on the parent to pass the latest season object
      setCurrentSeasonCompetitors(season.competitors || []);
    } else if (!isOpen) {
      setCurrentSeasonCompetitors([]); // Clear when modal closes
    }
    setCompetitorToAdd(''); // Reset selection
  }, [season, isOpen]);

  const availableSystemCompetitors = allCompetitors.filter(
    (systemComp) => !currentSeasonCompetitors.some((seasonComp) => seasonComp.id === systemComp.id)
  );

  const handleAddCompetitorToSeason = async () => {
    if (!season || !competitorToAdd) {
      toast.error('Lütfen eklenecek bir yarışmacı seçin.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/seasons/addCompetitorToSeason?seasonId=${season.id}&competitorId=${competitorToAdd}`);
      toast.success('Yarışmacı sezona başarıyla eklendi.');
      onCompetitorsUpdated(); // Refresh data from parent
      setCompetitorToAdd(''); // Reset dropdown
    } catch (error: any) {
      console.error("Add competitor to season error:", error);
      toast.error(error.response?.data?.message || 'Yarışmacı eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCompetitorFromSeason = async (competitorId: CompetitorId) => {
    if (!season) return;
    // IMPORTANT: API endpoint for removing a competitor from a season is not specified.
    // Assuming an endpoint like: DELETE /seasons/removeCompetitorFromSeason?seasonId={season.id}&competitorId={competitorId}
    // This is a placeholder. Replace with your actual API call.
    const confirmRemove = window.confirm("Bu yarışmacıyı sezondan kaldırmak istediğinizden emin misiniz? Yarışmacının genel kaydı silinmeyecektir.");
    if (!confirmRemove) return;

    setIsSubmitting(true);
    try {
      // Replace with actual API call:
      // await api.delete(`/seasons/removeCompetitorFromSeason?seasonId=${season.id}&competitorId=${competitorId}`);
      // Optimistically update UI or rely on onCompetitorsUpdated
      setCurrentSeasonCompetitors(prev => prev.filter(c => c.id !== competitorId)); // Optimistic
      onCompetitorsUpdated(); // Or fetch fresh data
      toast.success('Yarışmacı sezondan (simüle olarak) kaldırıldı.');
    } catch (error: any) {
      console.error("Remove competitor from season error:", error);
      toast.error(error.response?.data?.message || 'Yarışmacı kaldırılırken hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddPointsModal = (competitor: Competitor) => {
    setCompetitorForPoints(competitor);
    setIsAddPointsModalOpen(true);
  };

  const handlePointsAddedSuccessfully = () => {
    onCompetitorsUpdated(); // Refresh all data
    setIsAddPointsModalOpen(false); // Close points modal
    // The ManageSeasonCompetitorsModal remains open, showing updated data
  };

  if (!season) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`"${season.name}" Sezonu Yarışmacıları`} size="lg">
        <div className="space-y-6">
          {/* Add existing competitor to season */}
          <div className="border-b pb-4 mb-4 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Yeni Yarışmacı Ekle</h3>
            {availableSystemCompetitors.length > 0 ? (
              <div className="flex items-end space-x-2">
                <div className="flex-grow">
                  <Select
                    label="Eklenecek Yarışmacı"
                    id="competitorToAdd"
                    value={competitorToAdd}
                    onChange={(e) => setCompetitorToAdd(e.target.value)}
                    error={!competitorToAdd && isSubmitting ? "Yarışmacı seçimi zorunludur" : undefined}
                    className="w-full"
                  >
                    <option value="">-- Yarışmacı Seçin --</option>
                    {availableSystemCompetitors.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.name}</option>
                    ))}
                  </Select>
                </div>
                <Button 
                  onClick={handleAddCompetitorToSeason} 
                  isLoading={isSubmitting && !!competitorToAdd}
                  disabled={!competitorToAdd || isSubmitting}
                  variant="primary"
                >
                  <PlusIcon className="h-5 w-5 mr-1" /> Ekle
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Sezona eklenebilecek yeni yarışmacı bulunmuyor (tümü zaten bu sezonda veya sistemde kayıtlı yarışmacı yok).</p>
            )}
          </div>

          {/* List of current competitors in the season */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Sezondaki Yarışmacılar ({currentSeasonCompetitors.length})</h3>
            {currentSeasonCompetitors.length > 0 ? (
              <ul className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {currentSeasonCompetitors.map(competitor => (
                  <li key={competitor.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{competitor.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Puan: {competitor.totalPoints} | Katılım: {competitor.competitionCount}
                      </p>
                    </div>
                    <div className="space-x-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        onClick={() => handleOpenAddPointsModal(competitor)}
                        aria-label={`${competitor.name} için puan ekle`}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-500 dark:text-green-400 dark:hover:text-green-300 dark:border-green-600 dark:hover:border-green-400"
                      >
                        <CurrencyDollarIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveCompetitorFromSeason(competitor.id)}
                        isLoading={isSubmitting && false} // Placeholder for specific loading state if needed
                        disabled={isSubmitting}
                        aria-label={`${competitor.name} adlı yarışmacıyı sezondan kaldır`}
                      >
                        <UserMinusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Bu sezonda henüz yarışmacı bulunmuyor.</p>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={onClose} disabled={isSubmitting}>
              Kapat
            </Button>
          </div>
        </div>
      </Modal>

      {competitorForPoints && (
        <AddPointsToCompetitorModal
          isOpen={isAddPointsModalOpen}
          onClose={() => {
            setIsAddPointsModalOpen(false);
            setCompetitorForPoints(null);
          }}
          competitor={competitorForPoints}
          onPointsAdded={handlePointsAddedSuccessfully}
        />
      )}
    </>
  );
};

export default ManageSeasonCompetitorsModal;
