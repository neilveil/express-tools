"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = __importDefault(require("../env"));
const validate_1 = __importDefault(require("../validate"));
const joi_1 = __importDefault(require("joi"));
const response_1 = __importDefault(require("../response"));
const ET_DELAY = parseInt((0, env_1.default)('ET_DELAY', '0'));
const ET_VIEWS_DIR = (0, env_1.default)('ET_VIEWS_DIR');
const ET_STATIC_DIR = (0, env_1.default)('ET_STATIC_DIR');
const ET_STATIC_ROOT = (0, env_1.default)('ET_STATIC_ROOT');
const ET_AUTO_INIT_R = (0, env_1.default)('ET_AUTO_INIT_R');
exports.default = () => {
    const app = (0, express_1.default)();
    if (process.env.NODE_ENV !== 'test') {
        console.log('\n-x-x-x-x-x-\n');
        console.log(new Date().toISOString().substring(0, 19).replace('T', ' '));
        console.log('\n-x-x-x-x-x-\n');
    }
    app.use((0, cors_1.default)());
    app.use((0, compression_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Express tools middleware
    app.use((req, res, next) => {
        const _req = req;
        _req.bind = {};
        res.setHeader('X-Powered-By', 'express-tools');
        next();
    });
    // Handle invalid json in post request
    app.use((error, req, res, next) => {
        if (error?.type === 'entity.parse.failed') {
            response_1.default.error({ req, res, error, httpCode: 400, code: 'INVALID_POST', message: 'Can not parse request!' });
        }
        else
            next();
    });
    if (ET_DELAY)
        app.use((req, res, next) => setTimeout(next, ET_DELAY));
    // Init response module
    if (ET_AUTO_INIT_R !== 'no')
        app.use(response_1.default.init);
    // Views middleware
    if (ET_VIEWS_DIR) {
        app.set('view engine', 'ejs');
        app.set('views', ET_VIEWS_DIR);
    }
    // Static middleware
    if (ET_STATIC_DIR) {
        const staticOptions = {
            setHeaders: (res, path, stat) => {
                response_1.default.success({ req: res.req, res, skip: true, size: stat.size, isStatic: true });
            },
            redirect: false,
            index: false
        };
        if (ET_STATIC_ROOT)
            app.use(ET_STATIC_ROOT, express_1.default.static(ET_STATIC_DIR, staticOptions));
        else
            app.use(express_1.default.static(ET_STATIC_DIR, staticOptions));
    }
    if (process.env.NODE_ENV === 'test') {
        app.get('/express-tools-success', (req, res) => response_1.default.success({ req, res }));
        app.get('/express-tools-error', (req, res) => response_1.default.error({ req, res }));
        app.get('/express-tools-redirect', (req, res) => response_1.default.redirect({ req, res, path: '/express-tools-success' }));
        app.get('/express-tools-validate-joi', (req, res, next) => validate_1.default.joi(req, res, next, {
            name: joi_1.default.string().length(4)
        }), (req, res) => response_1.default.success({ req, res }));
        app.get('/express-tools-validate-ajv', (req, res, next) => validate_1.default.ajv(req, res, next, {
            type: 'object',
            additionalProperties: false,
            required: ['name'],
            properties: {
                name: { type: 'string', minLength: 4 }
            }
        }), (req, res) => response_1.default.success({ req, res }));
    }
    return app;
};
