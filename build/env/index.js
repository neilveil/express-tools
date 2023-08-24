"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const load = () => {
    const envPath = path_1.default.join(process.cwd(), process.env.ENVF || '.env');
    const envExists = fs_1.default.existsSync(envPath) && fs_1.default.statSync(envPath).isFile();
    if (envExists)
        fs_1.default.readFileSync(envPath, { encoding: 'utf8' })
            .split('\n')
            .filter(x => !x.startsWith('#') && x.trim() && x.includes('='))
            .forEach(x => {
            const key = x.split('=')[0].trim();
            const value = x.split('=').slice(1).join('=').trim();
            process.env[key] = value;
        });
    else if (process.env.ENVF) {
        console.error(chalk_1.default.redBright(`"${envPath}" file not found!`));
        process.exit(1);
    }
};
load();
const env = (key, defaultValue) => process.env[key] || defaultValue || '';
env.refresh = load;
exports.default = env;
