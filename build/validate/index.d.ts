import { NextFunction, Request, Response } from 'express';
declare const main: {
    joi: (req: Request, res: Response, next: NextFunction, object?: any) => void;
    ajv: (req: Request, res: Response, next: NextFunction, schema?: any) => void;
};
export declare const EMPTY_REQUEST: (req: Request, res: Response, next: NextFunction) => void;
export default main;
