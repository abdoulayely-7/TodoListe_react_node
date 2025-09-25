import { response, type Request, type Response } from "express";
import { userservice } from "../services/user.service.js";
import { shemasinscrire, schemaLogin, type InscriptionInput,type LoginInput } from "../validator/login.validator.js";
import { error } from "console";
import { strict } from "assert";
import type { AuthRequest } from "../middlewares/auth.middleware.js";


const useservice = new userservice();


export async function inscription(req: Request<{}, {}, InscriptionInput>, res: Response) {
    try {
        const valide = shemasinscrire.safeParse(req.body)
        if (!valide.success) {
            res.status(400).json({
                message: "erreur lors de l'ajout",
                errors: valide.error.format(),
            });
            
            return
        }

        const user = await useservice.registre(valide.data);
        res.json(
            {
                message: "inscription reussi",
                data: user
            }
        )
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({
            message: "Erreur interne du serveur",
            error: error instanceof Error ? error.message : "Erreur inconnue"
        });
    }
}

export async function login(req: Request<{}, {}, LoginInput>, res: Response) {
    try {
        const verif = schemaLogin.safeParse(req.body);
        if (!verif.success) return res.status(400).json({
            message: "erreur lors de la connexion",
            errors: verif.error.format(),
        })

        const {token,user} = await useservice.login(verif.data)

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie("acces_token", token, {
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            secure: isProd,
            maxAge: 60 * 60 * 1000,
            path: '/',
        });

        res.json({
            message: "connexion reussi",
            data: user,
        // token:token
    })
    } catch (error) {
        console.error("Erreur lors du login:", error);
        res.status(500).json({
            message: "Erreur interne du serveur",
            error: error instanceof Error ? error.message : "Erreur inconnue"
        });
    }
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Non authentifié" });
        }

        const user = await useservice.findUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Destructuration sécurisée pour exclure le mot de passe
        const { password, ...userWithoutPassword } = user;
        res.json({
            message: "Utilisateur récupéré avec succès",
            data: userWithoutPassword
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
        res.status(500).json({
            message: "Erreur interne du serveur",
            error: error instanceof Error ? error.message : "Erreur inconnue"
        });
    }
}

export async function getAllUsers(req: AuthRequest, res: Response) {
    try {
        const users = await useservice.getAllUsers();
        res.json({
            message: "Utilisateurs récupérés avec succès",
            data: users
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        res.status(500).json({
            message: "Erreur interne du serveur",
            error: error instanceof Error ? error.message : "Erreur inconnue"
        });
    }
}

export async function logout(req: Request, res: Response) {
    try {
        // Invalider le cookie côté client
        const isProd = process.env.NODE_ENV === 'production';
        res.clearCookie('acces_token', {
            httpOnly: true,
            sameSite: isProd ? 'none' : 'lax',
            secure: isProd,
            path: '/',
        });
        return res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
    }
}