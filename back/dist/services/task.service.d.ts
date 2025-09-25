import { type TaskCreate, type TaskUpdate } from "../repositories/taskrepository.js";
export declare class TaskService {
    create(task: TaskCreate): Promise<{
        id: number;
        titre: string;
        description: string;
        etat: import("@prisma/client").$Enums.Etat;
        userId: number;
        photo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        titre: string;
        description: string;
        etat: import("@prisma/client").$Enums.Etat;
        userId: number;
        photo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findUserTasks(userId: number): Promise<{
        id: number;
        titre: string;
        description: string;
        etat: import("@prisma/client").$Enums.Etat;
        userId: number;
        photo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: number): Promise<({
        id: number;
        titre: string;
        description: string;
        etat: import("@prisma/client").$Enums.Etat;
        userId: number;
        photo: string | null;
        createdAt: Date;
        updatedAt: Date;
    } & {
        allowedUsers: import("@prisma/client").User[];
        user: import("@prisma/client").User;
    }) | null>;
    update(id: number, task: TaskUpdate): Promise<{
        id: number;
        titre: string;
        description: string;
        etat: import("@prisma/client").$Enums.Etat;
        userId: number;
        photo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: number): Promise<void>;
    addPermission(taskId: number, userId: number): Promise<{
        allowedUsers: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            nom: string;
            email: string;
            password: string;
        }[];
    } & {
        id: number;
        titre: string;
        description: string;
        etat: import("@prisma/client").$Enums.Etat;
        userId: number;
        photo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateEtat(id: number, etat: "ENCOURS" | "TERMINER"): Promise<{
        id: number;
        titre: string;
        description: string;
        etat: import("@prisma/client").$Enums.Etat;
        userId: number;
        photo: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
//# sourceMappingURL=task.service.d.ts.map