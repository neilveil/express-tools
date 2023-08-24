"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = __importDefault(require("../env"));
const tdbFilePath = path_1.default.resolve((0, env_1.default)('ET_TDB_FILE', '.tdb.json'));
const _tdbFileExists = () => fs_1.default.existsSync(tdbFilePath) && fs_1.default.statSync(tdbFilePath).isFile();
const init = () => {
    if (!fs_1.default.existsSync(tdbFilePath))
        fs_1.default.writeFileSync(tdbFilePath, '{}');
};
const get = (key, defaultValue) => {
    if (!_tdbFileExists())
        return;
    const content = fs_1.default.readFileSync(tdbFilePath).toString();
    const parsedContent = JSON.parse(content);
    return (key ? parsedContent[key] : parsedContent) || defaultValue;
};
const set = (key, value) => {
    if (!_tdbFileExists())
        return;
    const tdb = get();
    tdb[key] = value;
    fs_1.default.writeFileSync(tdbFilePath, JSON.stringify(tdb));
};
const clear = (key) => {
    if (!_tdbFileExists())
        return;
    const tdb = get();
    if (key)
        delete tdb[key];
    fs_1.default.writeFileSync(tdbFilePath, JSON.stringify(key ? tdb : {}));
};
exports.default = { init, get, set, clear };
