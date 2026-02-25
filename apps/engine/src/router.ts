import { Request, Response, Router } from 'express';
import { OrchestratorAgent } from './agents/index.js';
import { webhook } from "./bot/index.js";


const router = Router();

// ─── Engine Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'engine' });
});

// ─── Bot ─────────────────────────────────────────────────────────
router.post('/webhook', webhook);

// ─── Orchestrator Agent ────────────────────────────────────────────────────────────

router.post('/agent/orchestrator', async (_req: Request, res: Response) => {
    try {
        await OrchestratorAgent();
        res.json({ message: 'Orchestrator Agent triggered' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to run Orchestrator Agent', es: error });
    }
});

export default router;