import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moduleAlias from 'module-alias';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

moduleAlias.addAliases({
    '@': __dirname,
});