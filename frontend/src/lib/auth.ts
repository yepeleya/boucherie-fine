import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

interface UserPayload {
  id: number;
  email: string;
  nom: string;
  role: string;
}

/**
 * Vérifie et décode un token JWT
 * @param token - Token JWT à vérifier
 * @returns Promise<UserPayload | null>
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    if (!token) {
      return null;
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & {
      userId: number;
      email: string;
      nom: string;
      role: string;
    };
    
    if (!decoded.userId) {
      return null;
    }

    // Récupérer l'utilisateur en base pour s'assurer qu'il existe toujours
    const user = await prisma.utilisateur.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      nom: user.nom,
      role: user.role
    };
  } catch (error) {
    console.error('Erreur vérification token:', error);
    return null;
  }
}

/**
 * Génère un token JWT pour un utilisateur
 * @param user - Données utilisateur
 * @returns string - Token JWT
 */
export function generateToken(user: { id: number; email: string; nom: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      nom: user.nom,
      role: user.role
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '7d',
      issuer: 'boucherie-fine',
      audience: 'boucherie-fine-app'
    }
  );
}

/**
 * Middleware pour vérifier l'authentification
 * @param requiredRole - Rôle requis (optionnel)
 * @returns Function - Middleware
 */
export function requireAuth(requiredRole?: string) {
  return async (request: Request) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Token manquant');
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      throw new Error('Token invalide');
    }

    if (requiredRole && user.role !== requiredRole) {
      throw new Error('Permissions insuffisantes');
    }

    return user;
  };
}