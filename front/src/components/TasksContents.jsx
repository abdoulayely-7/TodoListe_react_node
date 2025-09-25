import { useState } from 'react';
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import TaskCard from './TaskCard.jsx';
import Button from './Button.jsx';
import Input from './Input.jsx';

const TasksContents = ({
  tasks = [],
  loading = false,
  error = null,
  showActions = false,
  onEdit,
  onDelete,
  onUpdateState,
  onCreateNew
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6; // Nombre de tâches par page

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.etat === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  // Réinitialiser la page quand les filtres changent
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Filtre par statut */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="ENCOURS">En cours</option>
              <option value="TERMINER">Terminé</option>
            </select>
          </div>
        </div>

        {/* Bouton créer nouvelle tâche */}
        {onCreateNew && (
          <Button onClick={onCreateNew} className="flex items-center space-x-2 ">
            <Plus className="h-4 w-4" />
            <span>Nouvelle tâche</span>
          </Button>
        )}
      </div>

      {/* Compteur de résultats et information de pagination */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div>
          {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''} trouvée{filteredTasks.length !== 1 ? 's' : ''}
          {searchTerm && ` pour "${searchTerm}"`}
        </div>
        {totalPages > 1 && (
          <div>
            Page {currentPage} sur {totalPages} • Affichage de {startIndex + 1} à {Math.min(endIndex, filteredTasks.length)} sur {filteredTasks.length}
          </div>
        )}
      </div>

      {/* Liste des tâches */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Aucune tâche ne correspond à vos critères de recherche'
              : 'Aucune tâche trouvée'
            }
          </div>
          {onCreateNew && (
            <Button onClick={onCreateNew} variant="outline">
              Créer votre première tâche
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                showActions={showActions}
                onEdit={onEdit}
                onDelete={onDelete}
                onUpdateState={onUpdateState}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              {/* Bouton précédent */}
              <Button
                variant="warning"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Précédent</span>
              </Button>

              {/* Numéros de page */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Afficher les pages autour de la page actuelle
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "warning" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className="w-10 h-10 p-0"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              {/* Bouton suivant */}
              <Button
                variant="warning"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center space-x-1"
              >
                <span>Suivant</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TasksContents;
