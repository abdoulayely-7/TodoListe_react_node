import { createContext, useContext, useState, useEffect } from 'react';
import { tasksService } from '../services/tasks.js';
import { useAuth } from './AuthContext.jsx';

const TasksContext = createContext();

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

export const TasksProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer toutes les tâches
  const fetchAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getAllTasks();
      setTasks(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la récupération des tâches');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les tâches de l'utilisateur
  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getUserTasks();
      setUserTasks(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la récupération de vos tâches');
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle tâche
  const createTask = async (taskData) => {
    try {
      setError(null);
      const newTask = await tasksService.createTask(taskData);
      setUserTasks(prev => [...prev, newTask]);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la création de la tâche');
      throw error;
    }
  };

  // Mettre à jour une tâche
  const updateTask = async (taskId, taskData) => {
    try {
      setError(null);
      const updatedTask = await tasksService.updateTask(taskId, taskData);
      
      // Mettre à jour dans les deux listes
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      setUserTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      
      return updatedTask;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour de la tâche');
      throw error;
    }
  };

  // Supprimer une tâche
  const deleteTask = async (taskId) => {
    try {
      setError(null);
      await tasksService.deleteTask(taskId);
      
      // Supprimer des deux listes
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setUserTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression de la tâche');
      throw error;
    }
  };

  // Ajouter une permission
  const addPermission = async (taskId, userId) => {
    try {
      setError(null);
      const result = await tasksService.addPermission(taskId, userId);
      // Recharger les tâches pour avoir les permissions mises à jour
      await fetchAllTasks();
      await fetchUserTasks();
      return result;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'ajout de permission');
      throw error;
    }
  };

  // Changer l'état d'une tâche
  const updateTaskState = async (taskId, etat) => {
    try {
      setError(null);
      const updatedTask = await tasksService.updateTaskState(taskId, etat);
      
      // Mettre à jour dans les deux listes
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask.data : task));
      setUserTasks(prev => prev.map(task => task.id === taskId ? updatedTask.data : task));
      
      return updatedTask;
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du changement d\'état');
      throw error;
    }
  };

  // Charger les données au montage si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllTasks();
      fetchUserTasks();
    }
  }, [isAuthenticated]);

  const value = {
    tasks,
    userTasks,
    loading,
    error,
    fetchAllTasks,
    fetchUserTasks,
    createTask,
    updateTask,
    deleteTask,
    addPermission,
    updateTaskState,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};
