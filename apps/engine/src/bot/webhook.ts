import { Request, Response } from 'express';
import { config } from '@repo/system-config';
import { UserSession } from "../user";
import { useLLModel } from "@repo/framwork";
import { LLModelType } from "@repo/types";
import { ManagerAgent } from "../agents";


export const webhook = async (req: Request, res: Response) => {
    const message = req.body.message;
    let replyMessage = '';

    const hasContent = message?.text || message?.document || message?.caption;

    if (hasContent) {
        const chatId: number = message.chat.id;
        const userSession = await UserSession({
            chatBotType: "telegram",
            userId: message.from.id,
            isBot: message.from.is_bot
        })


        switch (message.text) {
            case '/start':
                if (userSession.isNew) {
                    replyMessage = `Hello, ${message.from.first_name}! Welcome to Joby Hive. I am Joby, your AI job assistant. I will help you find a job soon. Feel free to ask me anything or send me your CV so I can start arranging interviews for you.`;
                } else {
                    replyMessage = `Hi, ${message.from.first_name}, welcome back! Let's get started. How can I help you today?`;
                }
                break;
            default:
                const result = await ManagerAgent({
                    sessionId: chatId.toString(),
                    userId: message.from.id.toString(),
                    userInput: message.text || message.caption,
                    uploadedFileUri: message.document?.file_id,
                    chatBotType: "telegram",
                    isBot: message.from.is_bot
                });
                replyMessage = result.reply || "I'm processing your request...";
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
}