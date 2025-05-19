import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import api from '@/lib/axios';
import { Season, Competitor, CompetitorId, ApiResponse } from '@/types'; // Added ApiResponse
import toast from 'react-hot-toast';
import { PlusIcon, UserMinusIcon, CurrencyDollarIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import AddPointsToCompetitorModal from './AddPointsToCompetitorModal';
import AddAgcCompetitorModal from './AddAgcCompetitorModal'; // Import the new modal

interface AgcSeasonCompetitorManagerProps {
  season: Season;
  allSystemCompetitors: Competitor[];
  onCompetitorsUpdated: () => void;
}

const AgcSeasonCompetitorManager: React.FC<AgcSeasonCompetitorManagerProps> = ({
  season,
  allSystemCompetitors,
  onCompetitorsUpdated,
}) => {
  const [currentSeasonCompetitors, setCurrentSeasonCompetitors] = useState<Competitor[]>([]);
  const [competitorToAdd, setCompetitorToAdd] = useState<CompetitorId | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddPointsModalOpen, setIsAddPointsModalOpen] = useState(false);
  const [competitorForPoints, setCompetitorForPoints] = useState<Competitor | null>(null);
  const [isAddCompetitorSystemModalOpen, setIsAddCompetitorSystemModalOpen] = useState(false); // State for new modal

  useEffect(() => {
    setCurrentSeasonCompetitors(season.competitors || []);
    setCompetitorToAdd('');
  }, [season]);

  const availableSystemCompetitorsForAdding = allSystemCompetitors.filter(
    (systemComp) => !currentSeasonCompetitors.some((seasonComp) => seasonComp.id === systemComp.id)
  );

  const handleAddCompetitorToSeason = async () => {
    if (!competitorToAdd) {
      toast.error('Lütfen eklenecek bir yarışmacı seçin.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/seasons/addCompetitorToSeason?seasonId=${season.id}&competitorId=${competitorToAdd}`);
      toast.success('Yarışmacı sezona başarıyla eklendi.');
      onCompetitorsUpdated();
      setCompetitorToAdd('');
    } catch (error: any) {
      console.error("Add competitor to season error:", error);
      toast.error(error.response?.data?.message || 'Yarışmacı eklenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCompetitorFromSeason = async (competitorId: CompetitorId) => {
    const confirmRemove = window.confirm("Bu yarışmacıyı sezondan kaldırmak istediğinizden emin misiniz? Yarışmacının genel kaydı ve puanları silinmeyecektir, sadece bu sezondan çıkarılacaktır.");
    if (!confirmRemove) return;

    setIsSubmitting(true);
    try {
      // Use the correct DELETE endpoint
      await api.delete(`/seasons/removeCompetitorFromSeason?seasonId=${season.id}&competitorId=${competitorId}`);
      toast.success('Yarışmacı sezondan başarıyla kaldırıldı.');
      onCompetitorsUpdated(); // Refresh data from parent
    } catch (error: any) {
      console.error("Remove competitor from season error:", error);
      toast.error(error.response?.data?.message || 'Yarışmacı sezondan kaldırılırken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddPointsModal = (competitor: Competitor) => {
    setCompetitorForPoints(competitor);
    setIsAddPointsModalOpen(true);
  };

  const handlePointsAddedSuccessfully = () => {
    onCompetitorsUpdated();
    setIsAddPointsModalOpen(false);
    setCompetitorForPoints(null);
  };

  const handleSystemCompetitorAdded = () => {
    onCompetitorsUpdated(); // This will refetch allSystemCompetitors on the parent page
    setIsAddCompetitorSystemModalOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
      {/* Add existing competitor to season section */}
      <div className="border-b dark:border-gray-700 pb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Sezona Yarışmacı Ekle
          </h2>
          <Button
            variant="primary"
            onClick={() => setIsAddCompetitorSystemModalOpen(true)}
          >
            <UserPlusIcon className="h-5 w-5 mr-1" /> Sisteme Yeni Yarışmacı Ekle
          </Button>
        </div>
        {availableSystemCompetitorsForAdding.length > 0 ? (
          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <Select
                label="Sistemdeki Yarışmacılar"
                id="competitorToAdd"
                value={competitorToAdd}
                onChange={(e) => setCompetitorToAdd(e.target.value)}
                error={!competitorToAdd && isSubmitting && !availableSystemCompetitorsForAdding.length ? "Yarışmacı seçimi zorunludur" : undefined}
                className="w-full"
                wrapperClassName="mb-0"
              >
                <option value="">-- Yarışmacı Seçin --</option>
                {availableSystemCompetitorsForAdding.map(comp => (
                  <option key={comp.id} value={comp.id}>{comp.name} (Puan: {comp.totalPoints})</option>
                ))}
              </Select>
            </div>
            <Button
              onClick={handleAddCompetitorToSeason}
              isLoading={isSubmitting && !!competitorToAdd}
              disabled={!competitorToAdd || isSubmitting}
              variant="primary"
              className="h-10" // Match select height
            >
              <PlusIcon className="h-5 w-5 mr-1" /> Ekle
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sezona eklenebilecek yeni yarışmacı bulunmuyor (tümü zaten bu sezonda veya sistemde uygun yarışmacı yok).
          </p>
        )}
      </div>

      {/* List of current competitors in the season */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Sezondaki Yarışmacılar ({currentSeasonCompetitors.length})
        </h2>
        {currentSeasonCompetitors.length > 0 ? (
          <ul className="space-y-3">
            {currentSeasonCompetitors.map(competitor => (
              <li 
                key={competitor.id} 
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{competitor.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    ID: {competitor.id}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Toplam Puan: {competitor.totalPoints} | Yarışma Sayısı: {competitor.competitionCount}
                  </p>
                </div>
                <div className="flex space-x-2 flex-shrink-0 w-full sm:w-auto justify-end">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenAddPointsModal(competitor)}
                    aria-label={`${competitor.name} için puan ekle/çıkar`}
                    disabled={isSubmitting}
                    className="text-xs" // className was "text-xs"
                  >
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" /> Puan Ekle/Çıkar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveCompetitorFromSeason(competitor.id)}
                    disabled={isSubmitting}
                    aria-label={`${competitor.name} adlı yarışmacıyı sezondan kaldır`}
                    className="text-xs"
                  >
                    <UserMinusIcon className="h-4 w-4 mr-1" /> Sezondan Çıkar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            Bu sezonda henüz yarışmacı bulunmuyor. Yukarıdan ekleyebilirsiniz.
          </p>
        )}
      </div>

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

      <AddAgcCompetitorModal
        isOpen={isAddCompetitorSystemModalOpen}
        onClose={() => setIsAddCompetitorSystemModalOpen(false)}
        onCompetitorAdded={handleSystemCompetitorAdded}
      />
    </div>
  );
};

export default AgcSeasonCompetitorManager;
