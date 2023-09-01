"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const app_1 = __importDefault(require("../app"));
const helpers_1 = require("../helpers");
const env_1 = __importDefault(require("../env"));
const _port = parseInt((0, env_1.default)('ET_PORT')) || 8080;
exports.default = (port = _port, callback) => {
    const app = (0, app_1.default)();
    const server = app.listen(port, () => {
        (0, helpers_1.getServerHostList)(port).map(host => {
            if (process.env.NODE_ENV !== 'test')
                console.log(`Server running on ${chalk_1.default.underline(host)}`);
        });
        if (callback)
            callback();
    });
    const __app = app;
    __app.close = (callback) => server.close(() => {
        if (callback)
            callback();
    });
    return app;
};
