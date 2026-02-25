import { Request, Response } from 'express';
import { config } from '@repo/system-config';
import { OrchestratorAgent } from "../agents/index.js";

export const webhook = async (req: Request, res: Response) => {
    // Always respond 200 immediately so Telegram doesn't retry
    res.sendStatus(200);

    try {
        const message = req.body.message;

        if (!message) return;

        const hasContent = message?.text || message?.document || message?.caption;

        if (!hasContent) return;

        const chatId: number = message.chat.id;
        let replyMessage = '';

        let uploadedFileBytes: Uint8Array | undefined;
        let fileFormat: 'pdf' | 'docx' | 'txt' | undefined;
        const fileId = message.document?.file_id;

        if (fileId) {
            try {
                const getFileResponse = await fetch(`${config.TELEGRAM_BOT_API}/getFile?file_id=${fileId}`);
                const fileData = await getFileResponse.json() as any;
                if (fileData.ok) {
                    const filePath = fileData.result.file_path;
                    const downloadUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_ACCESS_TOKEN}/${filePath}`;
                    const downloadResponse = await fetch(downloadUrl);
                    const arrayBuffer = await downloadResponse.arrayBuffer();
                    uploadedFileBytes = new Uint8Array(arrayBuffer);

                    const extension = message.document.file_name?.split('.').pop()?.toLowerCase();
                    if (extension === 'pdf') fileFormat = 'pdf';
                    else if (extension === 'docx') fileFormat = 'docx';
                    else fileFormat = 'txt';
                }
            } catch (e) {
                console.error('Error downloading file from Telegram:', e);
            }
        }

        // Proactively send "typing" action while agents are thinking
        try {
            await fetch(`${config.TELEGRAM_BOT_API}/sendChatAction`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
            });
        } catch (e) {
            console.error('Error sending chat action:', e);
        }

        // OrchestratorAgent handles state, history, and user session internally
        const result = await OrchestratorAgent({
            sessionId: chatId.toString(),
            userId: message.from.id.toString(),
            userInput: message.text || message.caption,
            uploadedFileUri: fileId,
            uploadedFileBytes,
            fileFormat,
            chatBotType: "telegram",
            isBot: message.from.is_bot,
            firstName: message.from.first_name,
            username: message.from.username
        });

        replyMessage = result.reply || "I'm processing your request...";

        if (replyMessage) {
            await fetch(`${config.TELEGRAM_BOT_API}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: replyMessage,
                    parse_mode: 'Markdown'
                }),
            });
        }

    } catch (error) {
        console.error('Webhook error:', error);
        // res.sendStatus already called above, so Telegram won't retry
    }
};