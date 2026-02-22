import { Router, Request, Response } from 'express';
import ManagerAgent from './agents/ManagerAgent';
import { config } from '@repo/system-config';

const router = Router();

// ─── Health ───────────────────────────────────────────────────────────────────

router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'engine' });
});

// ─── Telegram Webhook ─────────────────────────────────────────────────────────

router.post('/webhook', async (req: Request, res: Response) => {
    const message = req.body.message;

    if (message?.text) {
        const chatId: number = message.chat.id;
        console.log(message);

        let replyMessage = '';

        switch (message.text) {
            case '/start':
                replyMessage = `Hello, ${message.from.first_name} — how can I help you?`;
                break;
        }

        if (replyMessage) {
            await fetch(`${config.TELEGRAM_BOT_API}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: replyMessage }),
            });
        }
    }

    res.sendStatus(200);
});

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