import { useState, useRef } from "react";
import Swal from "sweetalert2";

export function useTaskForm(task = null, onSubmit) {
  const [formData, setFormData] = useState({
    titre: task?.titre || "",
    description: task?.description || "",
    photo: null,
  });
  const [audioBlob, setAudioBlob] = useState(null); // 🎯 audio
  const [audioURL, setAudioURL] = useState(
  task?.audio ? `http://localhost:3000${task.audio}` : null
);
 // prévisualisation audio
  const [formErrors, setFormErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(
    task?.photo ? `http://localhost:3000${task.photo}` : null
  );
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // validation
  const validateForm = () => {
    const errors = {};
    if (!formData.titre.trim()) errors.titre = "Le titre est requis";
    else if (formData.titre.trim().length < 3)
      errors.titre = "Le titre doit contenir au moins 3 caractères";

    if (!formData.description.trim()) errors.description = "La description est requise";
    else if (formData.description.trim().length < 10)
      errors.description = "La description doit contenir au moins 10 caractères";

    return errors;
  };

  // handlers photo
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({ ...prev, photo: "Veuillez sélectionner un fichier image" }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({ ...prev, photo: "La taille du fichier ne doit pas dépasser 5MB" }));
      return;
    }

    setFormData((prev) => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);

    if (formErrors.photo) setFormErrors((prev) => ({ ...prev, photo: "" }));
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    setPreviewUrl(task?.photo ? `http://localhost:3000${task.photo}` : null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // handlers champs texte
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Swal.fire({
        title: "Erreur",
        text: "Veuillez corriger les champs indiqués",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, ...(audioBlob && { audio: audioBlob }) };
      await onSubmit(payload);
      Swal.fire({
        title: task ? "Tâche modifiée !" : "Tâche créée !",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de soumettre la tâche",
        icon: "error",
        toast: true,
        position: "top-end",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    formErrors,
    previewUrl,
    audioBlob,
    audioURL,
    loading,
    fileInputRef,
    handleChange,
    handleFileChange,
    removePhoto,
    setAudioBlob,
    setAudioURL,
    handleSubmit,
  };
}
