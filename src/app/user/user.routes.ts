import { Request, Response, Router } from 'express';
import { prismaClient } from '../../loaders/prisma';
import { Route } from '../../routes/route';

export class UserRoutes extends Route {
  constructor(app: Router) {
    super(app, 'users');
    this.registerRoutes();
  }

  public registerRoutes = (): void => {
    this.route.post('/me', this.postMe);
  };

  private postMe = async (req: Request, res: Response) => {
    const { email } = req.body;

    await prismaClient.users.upsert({
      where: { email },
      update: {},
      create: {
        email,
        planId: 'FREE',
      },
    });

    return res.status(200).json();
  };
}
