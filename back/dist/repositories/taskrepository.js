import { PrismaClient } from "@prisma/client";
import { string } from "zod";
const prisma = new PrismaClient();
export class TaskRepository {
    async create(task) {
        return await prisma.task.create({
            data: task,
        });
    }
    async findAll() {
        return await prisma.task.findMany({
            include: {
                user: true,
                allowedUsers: true
            }
        });
    }
    async findUserTasks(userId) {
        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    { userId: userId }, // Tâches créées par l'utilisateur
                    { allowedUsers: { some: { id: userId } } } // Tâches où l'utilisateur a des permissions
                ]
            },
            include: {
                user: true,
                allowedUsers: true
            }
        });
        return tasks;
    }
    async findById(id) {
        return await prisma.task.findUnique({
            where: { id },
            include: {
                allowedUsers: true,
                user: true // Inclure les informations du propriétaire
            }
        });
    }
    async update(id, classe) {
        return await prisma.task.update({
            where: { id },
            data: classe,
        });
    }
    async delete(id) {
        await prisma.task.delete({
            where: { id },
        });
    }
    async addpermission(taskId, userId) {
        return await prisma.task.update({
            where: { id: taskId },
            data: {
                allowedUsers: {
                    connect: { id: userId }
                },
            },
            include: { allowedUsers: true }
        });
    }
    async updateEtat(id, etat) {
        return await prisma.task.update({
            where: { id },
            data: { etat },
        });
    }
}
//# sourceMappingURL=taskrepository.js.map