"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_REQUEST = void 0;
const joi_1 = __importDefault(require("joi"));
const ajv_1 = __importDefault(require("ajv"));
const response_1 = __importDefault(require("../response"));
const chalk_1 = __importDefault(require("chalk"));
const ajvi = new ajv_1.default();
const main = {
    joi: (req, res, next, object = {}) => {
        try {
            if ((req.method === 'GET' && Object.keys(req.body).length) ||
                (req.method === 'POST' && Object.keys(req.query).length))
                return response_1.default.error({ req, res, message: 'Use either query string or body' });
            const schema = {};
            for (const key in object)
                schema[key] = object[key];
            const { error, value } = joi_1.default.object(schema).validate(req.method === 'GET' ? req.query : req.body, {
                allowUnknown: false,
                presence: 'required'
            });
            if (error)
                return response_1.default.error({ req, res, httpCode: 400, code: 'VALIDATION_ERROR', error });
            const _req = req;
            _req.bind.args = value;
            next();
        }
        catch (error) {
            console.error(chalk_1.default.redBright(error));
        }
    },
    ajv: (req, res, next, schema = {}) => {
        try {
            if ((req.method === 'GET' && Object.keys(req.body).length) ||
                (req.method === 'POST' && Object.keys(req.query).length))
                return response_1.default.error({ req, res, message: 'Use either query string or body' });
            const validator = ajvi.compile(schema);
            const value = req.method === 'GET' ? req.query : req.body;
            validator(value);
            const errors = validator.errors;
            if (errors)
                return response_1.default.error({
                    req,
                    res,
                    httpCode: 400,
                    code: 'VALIDATION_ERROR',
                    error: new Error(`${errors[0].schemaPath} ${errors[0].message}`)
                });
            const _req = req;
            _req.bind.args = value;
            next();
        }
        catch (error) {
            console.error(chalk_1.default.redBright(error));
        }
    }
};
const EMPTY_REQUEST = (req, res, next) => main.joi(req, res, next, {});
exports.EMPTY_REQUEST = EMPTY_REQUEST;
exports.default = main;
