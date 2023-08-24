"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const env_1 = __importDefault(require("../env"));
const ET_LOGS = (0, env_1.default)('ET_LOGS') === 'yes';
const ET_DEBUG = (0, env_1.default)('ET_DEBUG') === 'yes';
const ET_ID_PREFIX = (0, env_1.default)('ET_ID_PREFIX', '');
const RPS_DURATION = 1000; // milliseconds
let requestsToCalcRPS = [];
const startRPSupdateLoop = () => {
    if (process.env.NODE_ENV !== 'test')
        setInterval(() => {
            const rpsDurationTS = new Date().getTime() - RPS_DURATION;
            requestsToCalcRPS = requestsToCalcRPS.filter(ts => ts > rpsDurationTS);
        }, RPS_DURATION);
};
let totalRequestsServed = 0;
let avgResponseSize = 0;
let avgProcessionTime = 0;
const getRPS = () => requestsToCalcRPS.length - 1;
const getAvgResponseSize = () => parseInt(avgResponseSize.toString());
const getAvgProcessionTime = () => parseInt(avgProcessionTime.toString());
const getTotalRequestsServed = () => totalRequestsServed;
// Request format
//  Key | Timestamp | Request ID :: Method | Path | IP
// REQ | 2021-07-22T11:05:39.987Z | 1 :: GET | /user/auth | 48.55.42.21
// Response format
// Key | Timestamp | Request ID :: HTTP code | Code | Messasge | Response size | Processing time
// SCS | 2021-07-22T11:05:39.987Z | 1 :: 200 | OK | Successfully created | 224 | 118
// ERR | 2021-07-22T11:05:39.987Z | 1 :: 500 | ERROR | User not found! | 224 | 118
// RDR | 2021-07-22T11:05:39.987Z | 1 :: 302 | - | https://redirect.com" | - | 118
// TPL | 2021-07-22T11:05:39.987Z | 1 :: 200 | - | page/product/info | 224 | 118
const print = (type, content) => {
    if (!ET_LOGS)
        return;
    const prefix = [type, new Date().toISOString()];
    const cleanContent = content.map((x) => (['', undefined].includes(x) ? '-' : x));
    const log = prefix.join(' | ') + ' :: ' + ET_ID_PREFIX + cleanContent.join(' | ');
    switch (type) {
        // Blue
        case 'REQ':
            console.log(chalk_1.default.blueBright(log));
            break;
        // Green
        case 'SCS':
            console.log(chalk_1.default.greenBright(log));
            break;
        // Green
        case 'TPL':
            console.log(chalk_1.default.greenBright(log));
            break;
        // Red
        case 'ERR':
            console.log(chalk_1.default.redBright(log));
            break;
        // Cyan
        case 'RDR':
            console.log(chalk_1.default.cyanBright(log));
            break;
    }
};
let running = false;
let id = 0;
const init = (req, res, next) => {
    if (!running) {
        startRPSupdateLoop();
        running = true;
    }
    requestsToCalcRPS.push(new Date().getTime());
    totalRequestsServed++;
    id++;
    const xForwardedFor = req.headers['x-forwarded-for'];
    const _req = req;
    _req.IP = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : (xForwardedFor || '').split(', ')[0] || req.socket.remoteAddress || '';
    if (_req.IP === '::1')
        _req.IP = '127.0.0.1';
    _req.id = id;
    _req.ts = new Date();
    const log = [_req.id, req.method, req.path, _req.IP];
    print('REQ', log);
    next();
};
const success = (params) => responseHandler(params, 'success');
const error = (params) => responseHandler(params, 'error');
const template = (params) => responseHandler(params, 'template');
const redirect = (params) => responseHandler(params, 'redirect');
const setIfUndefined = (value, alt) => (value === undefined ? alt : value);
const responseHandler = (params, responseType) => {
    if (ET_DEBUG && params.error)
        console.error(params.error);
    const _req = params.req;
    if (_req.dead)
        return console.log(chalk_1.default.redBright(`!!! Dead request !!! ${_req.id} !!!`));
    _req.dead = true;
    const id = _req.id;
    const payload = params.payload === undefined ? {} : params.payload;
    const responseSize = size(params.payload);
    avgResponseSize = (avgResponseSize * (totalRequestsServed - 1) + responseSize) / totalRequestsServed;
    const processingTime = new Date().getTime() - _req.ts?.getTime();
    avgProcessionTime = (avgProcessionTime * (totalRequestsServed - 1) + processingTime) / totalRequestsServed;
    let response = {}, httpCode, message = '', _path, code, log;
    switch (responseType) {
        case 'success':
            httpCode = setIfUndefined(params.httpCode, 200);
            code = setIfUndefined(params.code, 'OK');
            if (typeof params.message === 'string')
                message = params.message;
            response = {
                id,
                code,
                message,
                payload
            };
            if (!params.skip)
                params.res.status(httpCode).json(response).end();
            log = [id, httpCode, code, message || '-', responseSize, processingTime];
            print('SCS', log);
            break;
        case 'error':
            httpCode = setIfUndefined(params.httpCode, 500);
            code = setIfUndefined(params.code, 'ERROR');
            if (params.message && typeof params.message === 'string')
                message = params.message;
            else if (params.error instanceof Error)
                message = params.error.message;
            response = {
                id,
                code,
                message,
                payload
            };
            if (!params.skip)
                params.res.status(httpCode).json(response).end();
            log = [id, httpCode, code, message || '-', responseSize, processingTime];
            print('ERR', log);
            break;
        case 'template':
            httpCode = params.httpCode || 200;
            if (!params.path)
                throw new Error(`Path in template type response can not be empty`);
            if (!params.skip)
                params.res.status(httpCode).render(params.path, params.payload);
            log = [id, httpCode, '-', params.path, responseSize, processingTime];
            print('TPL', log);
            break;
        case 'redirect':
            httpCode = params.httpCode || 302;
            _path = setIfUndefined(params.path, '/');
            if (!params.skip)
                params.res.status(302).redirect(_path);
            log = [id, httpCode, '-', _path, '-', processingTime];
            print('RDR', log);
            break;
    }
};
const size = (obj) => {
    let bytes = 0;
    const sizeOf = (obj) => {
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number':
                    bytes += 8;
                    break;
                case 'string':
                    bytes += obj.length * 2;
                    break;
                case 'boolean':
                    bytes += 4;
                    break;
                case 'object':
                    // eslint-disable-next-line
                    let objClass = Object.prototype.toString.call(obj).slice(8, -1);
                    if (objClass === 'Object' || objClass === 'Array') {
                        for (const key in obj) {
                            // eslint-disable-next-line
                            if (!obj.hasOwnProperty(key))
                                continue;
                            sizeOf(obj[key]);
                        }
                    }
                    else
                        bytes += obj.toString().length * 2;
                    break;
            }
        }
        return bytes;
    };
    return sizeOf(obj);
};
exports.default = {
    init,
    success,
    template,
    error,
    redirect,
    getRPS,
    getAvgResponseSize,
    getAvgProcessionTime,
    getTotalRequestsServed
};
