import express from 'express';
import { config } from '@repo/system-config';
import router from './router.js';

// App
const app = express();
const port = config.ENGINE_PORT;

app.use(express.json());
app.use(router);

// Banner
const RESET = '\x1b[0m';
const G = [
    '\x1b[38;5;202m', // deep orange
    '\x1b[38;5;208m', // orange
    '\x1b[38;5;214m', // amber-orange
    '\x1b[38;5;220m', // amber-yellow
    '\x1b[38;5;215m', // soft peach-orange
    '\x1b[38;5;209m', // warm coral
];

const ASCII_LOGO = `
${G[0]}     ██╗ ██████╗ ██████╗ ██╗   ██╗    ██╗  ██╗██╗██╗   ██╗███████╗
${G[1]}     ██║██╔═══██╗██╔══██╗╚██╗ ██╔╝    ██║  ██║██║██║   ██║██╔════╝
${G[2]}     ██║██║   ██║██████╔╝ ╚████╔╝     ███████║██║██║   ██║█████╗  
${G[3]}██   ██║██║   ██║██╔══██╗  ╚██╔╝      ██╔══██║██║╚██╗ ██╔╝██╔══╝  
${G[4]}╚█████╔╝╚██████╔╝██████╔╝   ██║       ██║  ██║██║ ╚████╔╝ ███████╗  JobyHive - AI Job Agent Assistant v1.0
${G[5]} ╚════╝  ╚═════╝ ╚═════╝    ╚═╝       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝  By: Ahmed.M.Yassin
${RESET}`;

const FOOTER = `${G[2]}Licensed under the Apache License, Version 2.0.\nFor more info: https://www.apache.org/licenses/LICENSE-2.0
************************************************************************************************************${RESET}`;

// Start
app.listen(port, () => {
    console.log(ASCII_LOGO);
    console.log(FOOTER);
    console.log(`\n• \x1b[32m[Engine]\x1b[0m Backend server running on port ${port}`);
});