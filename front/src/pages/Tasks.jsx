import { useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TasksContext.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import TasksContents from '../components/TasksContents.jsx';
import TaskForm from '../components/TaskForm.jsx';
import Navbar from '../components/Navbar.jsx';

const Tasks = () => {
  const {
    userTasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskState,
    fetchUserTasks
  } = useTasks();
  const { user } = useAuth();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleCreateNew = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleDelete = async (taskId) => {
    const result = await Swal.fire({
      title: 'Supprimer cette tâche ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(taskId);
        await fetchUserTasks();
        Swal.fire({
          title: 'Supprimé !',
          text: 'La tâche a été supprimée.',
          icon: 'success',
          timer: 3000,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Swal.fire({
          title: 'Erreur',
          text: 'Impossible de supprimer la tâche',
          icon: 'error',
          timer: 3000,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
        });
      }
    }
  };

  const handleUpdateState = async (taskId, newState) => {
    try {
      await updateTaskState(taskId, newState);
      Swal.fire({
        title: 'Mise à jour réussie',
        text: 'L’état de la tâche a été modifié.',
        icon: 'success',
        timer: 2500,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Erreur lors du changement d\'état:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de changer l’état de la tâche',
        icon: 'error',
        timer: 3000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setFormLoading(true);

      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }

      setShowTaskForm(false);
      setEditingTask(null);

      // Rafraîchir les données
      await fetchUserTasks();

      Swal.fire({
        title: editingTask ? 'Tâche modifiée !' : 'Tâche créée !',
        icon: 'success',
        timer: 3000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Impossible de sauvegarder la tâche',
        icon: 'error',
        timer: 3000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const canModifyTask = (task) =>
    task.userId === user?.id ||
    task.allowedUsers?.some((allowedUser) => allowedUser.userId === user?.id);

  const tasksWithActions = userTasks.map((task) => ({
    ...task,
    canModify: canModifyTask(task)
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Tâches</h1>
          <p className="text-gray-600">
            Gérez vos tâches et celles auxquelles vous avez accès
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <TasksContents
              tasks={tasksWithActions}
              loading={loading}
              error={error}
              showActions={true}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdateState={handleUpdateState}
              onCreateNew={handleCreateNew}
            />
          </div>
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default Tasks;
