import express from 'express';
declare const main: {
    joi: (req: express.Request, res: express.Response, next: express.NextFunction, object?: any) => void;
    ajv: (req: express.Request, res: express.Response, next: express.NextFunction, schema?: any) => void;
};
export declare const EMPTY_REQUEST: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
export default main;
