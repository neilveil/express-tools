"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.EMPTY_REQUEST = exports._validate = exports._tdb = exports._r = exports._env = exports._app = exports._md5 = exports._encrypt = exports._decrypt = exports.$router = exports.$express = exports.$joi = exports.$chalk = exports.$axios = exports.$ajv = void 0;
// Modules
var ajv_1 = require("ajv");
Object.defineProperty(exports, "$ajv", { enumerable: true, get: function () { return __importDefault(ajv_1).default; } });
var axios_1 = require("axios");
Object.defineProperty(exports, "$axios", { enumerable: true, get: function () { return __importDefault(axios_1).default; } });
var chalk_1 = require("chalk");
Object.defineProperty(exports, "$chalk", { enumerable: true, get: function () { return __importDefault(chalk_1).default; } });
var joi_1 = require("joi");
Object.defineProperty(exports, "$joi", { enumerable: true, get: function () { return __importDefault(joi_1).default; } });
const express_1 = __importDefault(require("express"));
exports.$express = express_1.default;
const $router = express_1.default.Router();
exports.$router = $router;
// Helpers
var crypto_1 = require("./crypto");
Object.defineProperty(exports, "_decrypt", { enumerable: true, get: function () { return crypto_1.decrypt; } });
Object.defineProperty(exports, "_encrypt", { enumerable: true, get: function () { return crypto_1.encrypt; } });
Object.defineProperty(exports, "_md5", { enumerable: true, get: function () { return crypto_1.md5; } });
var app_1 = require("./app");
Object.defineProperty(exports, "_app", { enumerable: true, get: function () { return __importDefault(app_1).default; } });
var env_1 = require("./env");
Object.defineProperty(exports, "_env", { enumerable: true, get: function () { return __importDefault(env_1).default; } });
var response_1 = require("./response");
Object.defineProperty(exports, "_r", { enumerable: true, get: function () { return __importDefault(response_1).default; } });
var tdb_1 = require("./tdb");
Object.defineProperty(exports, "_tdb", { enumerable: true, get: function () { return __importDefault(tdb_1).default; } });
var validate_1 = require("./validate");
Object.defineProperty(exports, "_validate", { enumerable: true, get: function () { return __importDefault(validate_1).default; } });
Object.defineProperty(exports, "EMPTY_REQUEST", { enumerable: true, get: function () { return validate_1.EMPTY_REQUEST; } });
const server_1 = __importDefault(require("./server"));
exports.server = server_1.default;
exports.default = server_1.default;
