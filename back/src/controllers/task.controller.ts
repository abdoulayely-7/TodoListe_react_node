import type { Request, Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { TaskService } from "../services/task.service.js";
import { actionHistoryService } from "../services/actionHistory.service.js";
import { shemaupdate, schemaUpdateEtat } from "../validator/task.js";

const taskService = new TaskService();

export async function getTasksbyUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    
    const tasks = await taskService.findUserTasks(Number( req.user.id));
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}



export async function getAllTasks(req: AuthRequest, res: Response) {
  try {
 
    
    const tasks = await taskService.findAll();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    res.status(500).json({ 
      message: "Erreur interne du serveur",
      error: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}





export async function getTasksById(req: Request<{ id: string }>, res: Response) {
  const idParam = req.params.id;
  if (!idParam) return res.status(400).json({ message: "id required" });

  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: "id must be a number" });

  const task = await taskService.findById(id);
  if (task) {
    // Record READ action if user present
    const maybeAuth = req as AuthRequest;
    if (maybeAuth.user) {
      try {
        await actionHistoryService.record({ userId: Number(maybeAuth.user.id), taskId: task.id, action: "READ", details: `Viewed task ${task.id}` });
      } catch (e) {
        console.error("Failed to record history (READ):", e);
      }
    }

    res.status(200).json(task);
  } else {
    res.status(404).json({ message: "Classe not found" });
  }
}

export async function createTasks(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  // Supporte upload.any() (array) et upload.fields() (object)
  const anyFiles = (req as any).files as Express.Multer.File[] | undefined;
  let photoPath: string | undefined;
  let audioPath: string | undefined;

  if (Array.isArray(anyFiles)) {
    const photoFile = anyFiles.find(f => f.fieldname === 'photo');
    const audioFile = anyFiles.find(f => f.fieldname === 'audio');
    if (photoFile) photoPath = `/uploads/photos/${photoFile.filename}`;
    if (audioFile) audioPath = `/uploads/audios/${audioFile.filename}`;
  } else {
    const filesMap = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    photoPath = filesMap?.photo?.[0] ? `/uploads/photos/${filesMap.photo[0].filename}` : undefined;
    audioPath = filesMap?.audio?.[0] ? `/uploads/audios/${filesMap.audio[0].filename}` : undefined;
  }

  // Exclure les champs 'photo' et 'audio' envoyés en body (ex: {})
  const { photo: _photoBody, audio: _audioBody, ...restBody } = req.body as any;

  const payload = {
    ...restBody,
    userId: user.id,
    ...(photoPath && { photo: photoPath }),
    ...(audioPath && { audio: audioPath }),
  };

  try {
    const created = await taskService.create(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la création de la tâche" });
  }
}



export async function updateTasks(req: AuthRequest, res: Response) {
  const paramsReq = req as AuthRequest & { params: { id: string } };
  const idParam = paramsReq.params.id;
  if (!idParam) return res.status(400).json({ message: "id required" });

  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: "id must be a number" });

  try {
    const anyFiles = (req as any).files as Express.Multer.File[] | undefined;
    let photoPath: string | undefined;
    let audioPath: string | undefined;

    if (Array.isArray(anyFiles)) {
      const photoFile = anyFiles.find(f => f.fieldname === 'photo');
      const audioFile = anyFiles.find(f => f.fieldname === 'audio');
      if (photoFile) photoPath = `/uploads/photos/${photoFile.filename}`;
      if (audioFile) audioPath = `/uploads/audios/${audioFile.filename}`;
    } else {
      const filesMap = (req as any).files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      photoPath = filesMap?.photo?.[0] ? `/uploads/photos/${filesMap.photo[0].filename}` : undefined;
      audioPath = filesMap?.audio?.[0] ? `/uploads/audios/${filesMap.audio[0].filename}` : undefined;
    }

    // Exclure les champs 'photo' et 'audio' envoyés en body (ex: {})
    const { photo: _photoBody, audio: _audioBody, ...restBody } = req.body as any;

    const payload = {
      ...restBody,
      ...(photoPath && { photo: photoPath }),
      ...(audioPath && { audio: audioPath }),
    };

    const updated = await taskService.update(id, payload);
    try {
      if (req.user) {
        await actionHistoryService.record({ userId: Number(req.user.id), taskId: updated.id, action: "UPDATE", details: `Updated task ${updated.id}` });
      }
    } catch (e) {
      console.error("Failed to record history (UPDATE):", e);
    }
    res.status(200).json(updated);
  } catch (err) {
    res.status(404).json({ message: "Classe not found" });
  }
}   


export async function deleteTasks(req: AuthRequest & Request<{ id: string }>, res: Response) {
  const idParam = req.params.id;
  if (!idParam) return res.status(400).json({ message: "id required" });

  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: "id must be a number" });

  try {
    await taskService.delete(id);
    // Record DELETE action
    try {
      if (req.user) {
        await actionHistoryService.record({ userId: Number(req.user.id), taskId: id, action: "DELETE", details: `Deleted task ${id}` });
      }
    } catch (e) {
      console.error("Failed to record history (DELETE):", e);
    }

    res.status(204).send();
  } catch (err) {
    res.status(404).json({ message: "Classe not found" });
  }
}

export async function Addpermission(req: AuthRequest & Request<{ id: string }>, res: Response) {
  const taskId = Number(req.params.id);
  const verif = shemaupdate.safeParse(req.body);
  if (!verif.success) return res.status(401).json({ message: "erreur" });
  
  const { userId } = verif.data;
  const up = await taskService.addPermission(taskId, userId);

  return res.status(200).json({
    message: "réussi",
    data: up
  });
}
    

export async function updateEtat(req: AuthRequest & Request<{ id: string }>, res: Response) {
  const idParam = req.params.id;
  if (!idParam) return res.status(400).json({ message: "id required" });

  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: "id must be a number" });

  const validation = schemaUpdateEtat.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      message: "Erreur de validation",
      errors: validation.error.format(),
    });
  }

  try {
    const { etat } = validation.data;
    const updated = await taskService.updateEtat(id, etat);
    res.status(200).json({
      message: "État mis à jour avec succès",
      data: updated
    });
  } catch (err) {
    res.status(404).json({ message: "Tâche non trouvée" });
  }
}
