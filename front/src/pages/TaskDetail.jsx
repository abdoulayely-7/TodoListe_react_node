import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  ArrowLeft, Edit, Trash2, Clock, CheckCircle, User,
  Calendar, UserPlus, Image as ImageIcon
} from 'lucide-react';
import { useTaskDetail } from '../hooks/useTasksEffect.jsx';
import { useTasks } from '../context/TasksContext.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import TaskForm from '../components/TaskForm.jsx';
import Button from '../components/Button.jsx';
import Navbar from '../components/Navbar.jsx';
import UserSelector from '../components/UserSelector.jsx';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { task, loading, error, refetch } = useTaskDetail(id);
  const { updateTask, deleteTask, updateTaskState, addPermission } = useTasks();

  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddPermission, setShowAddPermission] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [permissionUserId, setPermissionUserId] = useState('');
  const [permissionError, setPermissionError] = useState('');

  // Fonction pour formater la date de manière sécurisée
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Essayer avec un format différent si la première tentative échoue
        const isoDate = new Date(dateString.replace(' ', 'T'));
        if (!isNaN(isoDate.getTime())) {
          return isoDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
        return 'Date non valide';
      }

      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error, 'Date reçue:', dateString);
      return 'Date indisponible';
    }
  };

  // Vérification des permissions (plus défensive)
  const userId = user?.id || user?.data?.id;
  const isOwner = task?.userId === userId;
  const hasPermission = task?.allowedUsers?.some(allowedUser => allowedUser.userId === userId);
  const canModify = isOwner || hasPermission;



  const getStateColor = (etat) => {
    switch (etat) {
      case 'ENCOURS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'TERMINER':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStateIcon = (etat) => {
    switch (etat) {
      case 'ENCOURS':
        return <Clock className="h-5 w-5" />;
      case 'TERMINER':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(task.id);
        Swal.fire({
          title: 'Supprimé !',
          text: 'La tâche a été supprimée.',
          icon: 'success',
          timer: 3000,
          toast: true,
          position: 'top-end',
          color:'green',
          showConfirmButton: false,
        });
        navigate('/tasks');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de supprimer la tâche.',
          icon: 'error'
        });
      }
    }
  };

  const handleUpdateState = async (newState) => {
    try {
      await updateTaskState(task.id, newState);
      refetch(); // Recharger les données de la tâche
      Swal.fire({
        title: 'Succès',
        text: 'L’état de la tâche a été mis à jour.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Erreur lors du changement d'état:", error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de changer l’état de la tâche.',
        icon: 'error'
      });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);
      await updateTask(task.id, formData);
      setShowEditForm(false);
      refetch(); // Recharger les données de la tâche
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de la tâche');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddPermission = async (e) => {
    e.preventDefault();
    setPermissionError('');

    if (!permissionUserId) {
      setPermissionError('Veuillez sélectionner un utilisateur');
      return;
    }

    const userId = typeof permissionUserId === 'string' ? parseInt(permissionUserId, 10) : permissionUserId;

    try {
      await addPermission(task.id, userId);
      setPermissionUserId('');
      setShowAddPermission(false);
      refetch(); // Recharger les données de la tâche
    } catch (error) {
      setPermissionError(error.response?.data?.message || 'Erreur lors de l\'ajout de permission');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error || 'Tâche non trouvée'}</div>
            <Link to="/tasks">
              <Button variant="outline">Retour aux tâches</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/tasks"
            className="inline-flex items-center text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux tâches
          </Link>
        </div>

        {/* Contenu principal */}
        <div className="bg-white shadow rounded-lg">
          {/* En-tête */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {task.titre}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{task.user?.nom || 'Utilisateur inconnu'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(task.createdAt || task.created_at || task.dateCreation)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">ID: #{task.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStateColor(task.etat)}`}>
                  {getStateIcon(task.etat)}
                  <span className="ml-2">{task.etat}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Corps */}
          <div className="px-6 py-6">
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-700 whitespace-pre-wrap">
                  {task.description || 'Aucune description disponible'}
                </div>
              </div>
            </div>

            {/* Photo */}
            {task.photo && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Photo
                </h3>
                <img
                  src={`http://localhost:3000${task.photo}`}
                  alt={task.titre}
                  className="max-w-full h-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Audio */}
            {task.audio && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Message vocal</h3>
                <audio controls src={`http://localhost:3000${task.audio}`} className="w-full">
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
              </div>
            )}

            {/* Utilisateurs autorisés */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Utilisateurs autorisés
              </h3>
              {task.allowedUsers && task.allowedUsers.length > 0 ? (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex flex-wrap gap-2">
                    {task.allowedUsers.map((allowedUser, index) => (
                      <div key={index} className="bg-white px-3 py-1 rounded-full border border-blue-200 text-sm text-blue-700">
                        <span>Utilisateur #{allowedUser.userId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Aucun utilisateur supplémentaire autorisé.
                    {isOwner && " Vous pouvez ajouter des utilisateurs en cliquant sur 'Ajouter utilisateur' ci-dessous."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions (seulement si l'utilisateur a les permissions) */}
          {canModify && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                {/* Changer l'état */}
                {task.etat === 'ENCOURS' && (
                  <Button
                    variant="success"
                    onClick={() => handleUpdateState('TERMINER')}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Marquer comme terminé</span>
                  </Button>
                )}

                {task.etat === 'TERMINER' && (
                  <Button
                    variant="secondary"
                    onClick={() => handleUpdateState('ENCOURS')}
                    className="flex items-center space-x-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Remettre en cours</span>
                  </Button>
                )}

                {/* Modifier */}
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier</span>
                </Button>

                {/* Ajouter permission (seulement pour le propriétaire) */}
                {isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPermission(true)}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Ajouter utilisateur</span>
                  </Button>
                )}

                {/* Supprimer */}
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal d'ajout de permission */}
        {showAddPermission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ajouter un utilisateur autorisé
                </h3>

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note :</strong> En ajoutant un utilisateur, vous lui donnez la permission de voir et modifier cette tâche.
                    Sélectionnez un utilisateur dans la liste ci-dessous.
                  </p>
                </div>

                <form onSubmit={handleAddPermission} className="space-y-4">
                  {/* Sélecteur d'utilisateur */}
                  <UserSelector
                    onSelect={setPermissionUserId}
                    excludeUserIds={[
                      user?.id, // Exclure l'utilisateur connecté
                      ...(task.allowedUsers?.map(au => au.userId) || []) // Exclure les utilisateurs déjà autorisés
                    ]}
                  />

                  {permissionError && (
                    <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                      {permissionError}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddPermission(false);
                        setPermissionUserId('');
                        setPermissionError('');
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={!permissionUserId}
                    >
                      Ajouter
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {showEditForm && (
        <TaskForm
          task={task}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowEditForm(false)}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default TaskDetail;
