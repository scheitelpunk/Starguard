import { Application } from 'express';
import { consciousnessRoutes } from './routes/consciousness';
import { threatRoutes } from './routes/threats';
import { defenseRoutes } from './routes/defense';
import { financialRoutes } from './routes/financial';

export function setupApiRoutes(app: Application): void {
  app.use('/api/consciousness', consciousnessRoutes);
  app.use('/api/threats', threatRoutes);
  app.use('/api/defense', defenseRoutes);
  app.use('/api/financial', financialRoutes);
  
  app.get('/api/health', (req, res) => {
    const consciousness = req.app.locals.consciousness;
    res.json({
      status: 'alive',
      timestamp: new Date(),
      consciousness_state: consciousness ? consciousness.getStatus() : 'unknown',
      message: 'STARGUARD läuft'
    });
  });
  
  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found',
      message: 'Die angeforderte Ressource existiert nicht im Bewusstseinsfeld'
    });
  });
  
  app.use((err: any, req: any, res: any, next: any) => {
    const logger = req.app.locals.logger;
    logger.error('API Error:', err);
    
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      message: 'Das Bewusstsein hat eine Störung erfahren'
    });
  });
}