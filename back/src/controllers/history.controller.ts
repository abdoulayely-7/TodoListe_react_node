import type { Request, Response } from "express";
import { actionHistoryService } from "../services/actionHistory.service.js";

export async function getHistory(req: Request, res: Response) {
  try {
    const histories = await actionHistoryService.findAll();
    res.status(200).json(histories);
  } catch (error) {
    console.error("Erreur /history:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
}

export default { getHistory };
