// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { Buffer } from 'buffer';

/**
 * Middleware to verify authentication header and validate username and password using the database.
 *
 * @file auth.ts
 * @author syadav7173
 */

declare global {
    namespace Express {
      interface Request {
        user?: {
          user_name: string;
          password: string;
        };
      }
    }
  }

/**
 * Verifies authentication header and validates the username and password using the database.
 *
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>}
 * 
 * @author syadav7173
 */
  const auth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized', value: [] });
    }
  
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [user_name, password] = credentials.split(':');
  
    const user = await AppDataSource.manager.findOne(User, { where: { user_name } });
  
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized', value: [] });
    }
  
    const encodedPassword = Buffer.from(password).toString('base64');
    if (encodedPassword !== user.password) {
      return res.status(401).json({ success: false, message: 'Unauthorized', value: [] });
    }
  
    req.user = { user_name, password };
    next();
  };
  
  export default auth;