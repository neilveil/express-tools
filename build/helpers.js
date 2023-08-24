"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerHostList = exports.getLocalIPList = void 0;
const os_1 = __importDefault(require("os"));
const getLocalIPList = () => Object.values(os_1.default.networkInterfaces())
    .map(x => (x && x[0] ? x[0].address : null))
    .filter(ip => /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(ip || ''));
exports.getLocalIPList = getLocalIPList;
const getServerHostList = (port) => {
    const ipList = getLocalIPList();
    if (ipList.includes('127.0.0.1'))
        ipList.unshift('localhost');
    return ipList.map(ip => `http://${ip}:${port}`);
};
exports.getServerHostList = getServerHostList;
