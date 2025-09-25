import { actionHistoryService } from "../services/actionHistory.service.js";
export async function getHistory(req, res) {
    try {
        const histories = await actionHistoryService.findAll();
        res.status(200).json(histories);
    }
    catch (error) {
        console.error("Erreur /history:", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
}
export default { getHistory };
//# sourceMappingURL=history.controller.js.map