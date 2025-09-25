import api from './api.js';

export const tasksService = {
  // Récupérer toutes les tâches (Dashboard)
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  // Récupérer les tâches de l'utilisateur connecté
  getUserTasks: async () => {
    const response = await api.get('/tasks/tasksuser');
    return response.data;
  },

  // Récupérer une tâche par ID
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Créer une nouvelle tâche
  createTask: async (taskData) => {
    const formData = new FormData();
    
    // Ajouter tous les champs sauf le fichier
    Object.keys(taskData).forEach(key => {
      if (key !== 'photo') {
        formData.append(key, taskData[key]);
      }
    });

    // Ajouter le fichier s'il existe
    if (taskData.photo) {
      formData.append('photo', taskData.photo);
    }

    const response = await api.post('/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Mettre à jour une tâche
  updateTask: async (id, taskData) => {
    const formData = new FormData();
    
    // Ajouter tous les champs sauf le fichier
    Object.keys(taskData).forEach(key => {
      if (key !== 'photo') {
        formData.append(key, taskData[key]);
      }
    });

    // Ajouter le fichier s'il existe
    if (taskData.photo) {
      formData.append('photo', taskData.photo);
    }

    const response = await api.put(`/tasks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer une tâche
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Ajouter un utilisateur autorisé à une tâche
  addPermission: async (taskId, userId) => {
    const response = await api.post(`/tasks/${taskId}/permission`, { userId });
    return response.data;
  },

  // Changer l'état d'une tâche
  updateTaskState: async (taskId, etat) => {
    const response = await api.patch(`/tasks/${taskId}/etat`, { etat });
    return response.data;
  },
};
