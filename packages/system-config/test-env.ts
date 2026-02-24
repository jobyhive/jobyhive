import { config } from './src/index.ts';

console.log('--- Environment Check ---');
console.log('ELASTICSEARCH_URL:', config.ELASTICSEARCH_URL || '(empty)');
console.log('ELASTICSEARCH_API_KEY:', config.ELASTICSEARCH_API_KEY || '(empty)');
console.log('AWS_ACCESS_KEY_ID:', config.AWS_ACCESS_KEY_ID || '(empty)');
console.log('CWD:', process.cwd());
console.log('-------------------------');
