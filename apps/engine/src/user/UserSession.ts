import { useLongMemory } from "@repo/framwork";
import { keccak256 } from "@repo/security";

/**
 * UserSession Schema for Long-Term Memory
 */
export interface UserSessionRecord {
    id: string;          // hashed id
    userId: string;
    chatBotType: string;
    isBot: boolean;
    firstName?: string;
    username?: string;
    createdDate: string; // ISO date
}

/**
 * UserSession Result Object
 */
export interface UserSessionResult extends UserSessionRecord {
    isNew: boolean;      // true if record was just created
}

/**
 * Props for UserSession function
 */
export interface UserSessionProps {
    chatBotType: string;
    userId: string;
    isBot: boolean;
    firstName?: string;
    username?: string;
}

/**
 * Manages user session registration and retrieval using long-term memory storage.
 * 
 * @param props UseSessionProps
 * @returns Promise<UserSessionResult>
 */
export async function UserSession(props: UserSessionProps): Promise<UserSessionResult> {
    const { chatBotType, userId, isBot, firstName, username } = props;
    const memory = useLongMemory();

    // 1️⃣ Generate Deterministic ID
    const id = keccak256(chatBotType + userId);

    // 2️⃣ Check Registration
    const indexName = "joby-user-sessions";
    const existingRecord = await memory.get<UserSessionRecord>(indexName, id);

    if (existingRecord) {
        return {
            ...existingRecord,
            isNew: false
        };
    }

    // If the user does NOT exist: Store a new record
    const createdDate = new Date().toISOString();
    const newRecord: UserSessionRecord = {
        id,
        userId,
        chatBotType,
        isBot,
        firstName,
        username,
        createdDate
    };

    await memory.index(indexName, id, newRecord);

    return {
        ...newRecord,
        isNew: true
    };
}