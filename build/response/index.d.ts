/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
interface params {
    req: Request;
    res: Response;
    code?: number | string;
    httpCode?: number;
    success?: boolean;
    message?: string;
    path?: string;
    error?: any;
    payload?: any;
    skip?: boolean;
}
declare const _default: {
    init: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    success: (params: params) => void;
    template: (params: params) => void;
    error: (params: params) => void;
    redirect: (params: params) => void;
    getRPS: () => number;
    getAvgResponseSize: () => number;
    getAvgProcessionTime: () => number;
    getTotalRequestsServed: () => number;
};
export default _default;
