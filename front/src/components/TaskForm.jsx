import { X, Upload } from "lucide-react";
import Button from "./Button.jsx";
import Input from "./Input.jsx";
import { useTaskForm } from "../hooks/useTaskForm.jsx";
import AudioRecorder from "./AudioRecorder.jsx";

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const {
    formData,
    formErrors,
    previewUrl,
    loading,
    fileInputRef,
    handleChange,
    handleFileChange,
    removePhoto,
    handleSubmit,
    setAudioBlob,
    setAudioURL,
    audioURL,
  } = useTaskForm(task, onSubmit);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {task ? "Modifier la tâche" : "Nouvelle tâche"}
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Titre"
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            error={formErrors.titre}
            placeholder="Titre de la tâche"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`block w-full px-3 py-2 border rounded-md ${formErrors.description ? "border-red-300" : "border-gray-300"}`}
              placeholder="Description de la tâche"
            />
            {formErrors.description && (
              <p className="text-sm text-red-600">{formErrors.description}</p>
            )}
          </div>

          {/* Upload de photo */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Photo (optionnelle)</label>

            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="w-full h-32 object-cover rounded-md border" />
                <button type="button" onClick={removePhoto} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Cliquez pour ajouter une photo</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 5MB</p>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            {formErrors.photo && <p className="text-sm text-red-600">{formErrors.photo}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Message vocal (optionnel)
            </label>
            <AudioRecorder
              onSave={(blob, url) => {
                setAudioBlob(blob);
                setAudioURL(url);
              }}
              existingAudio={audioURL}
            />

          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Annuler</Button>
            <Button type="submit" loading={loading} disabled={loading}>
              {loading ? (task ? "Modification..." : "Création...") : (task ? "Modifier" : "Créer")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
