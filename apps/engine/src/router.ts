import {Request, Response, Router} from 'express';
import {ManagerAgent} from './agents';
import {webhook} from "./bot";


const router = Router();

// ─── Engine Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'engine' });
});

// ─── Bot ─────────────────────────────────────────────────────────
router.post('/webhook', webhook);

// ─── Manager Agent ────────────────────────────────────────────────────────────

router.post('/agent/manager', async (_req: Request, res: Response) => {
    try {
        await ManagerAgent();
        res.json({ message: 'Manager Agent triggered' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run Manager Agent', es: error });
    }
});

export default router;