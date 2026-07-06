import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';

export const analyticsController = {
  async getSummary(req: Request, res: Response) {
    const data = await analyticsService.getSummary();
    res.json(data);
  },

  async getByDepartment(req: Request, res: Response) {
    const data = await analyticsService.getByDepartment();
    res.json(data);
  },

  async getByCountry(req: Request, res: Response) {
    const data = await analyticsService.getByCountry();
    res.json(data);
  }
};