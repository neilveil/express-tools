"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const _resize = (data, size, fill = 'X') => data.substring(0, size) + fill.repeat(size - data.substring(0, size).length);
const _genKeyIv = (data) => {
    data = _resize(data, 48);
    const _key = data.substring(0, 32);
    const _iv = data.substring(32, 48);
    return { _key, _iv };
};
const encrypt = (data, key) => {
    const { _key, _iv } = _genKeyIv(key);
    const dataBuffer = Buffer.from(data, 'binary');
    const dataB64 = dataBuffer.toString('base64');
    const cipher = crypto_1.default.createCipheriv('aes-256-cbc', _key, _iv);
    const result = cipher.update(dataB64, 'binary', 'base64') + cipher.final('base64');
    return result;
};
exports.encrypt = encrypt;
const decrypt = (data, key) => {
    const { _key, _iv } = _genKeyIv(key);
    const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', _key, _iv);
    return Buffer.from(decipher.update(data, 'base64', 'binary') + decipher.final('binary'), 'base64').toString();
};
exports.decrypt = decrypt;
const md5 = (content) => crypto_1.default.createHash('md5').update(content).digest('hex');
exports.md5 = md5;
