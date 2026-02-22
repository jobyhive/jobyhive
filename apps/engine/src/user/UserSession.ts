import {useLongMemory} from "@repo/framwork";


interface UserSessionProps{
    chatBotType: 'telegram';
    userId: string;
    userName: string;
}


const UserSession = (props: UserSessionProps): void => {
    const memory = useLongMemory();
}