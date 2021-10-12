declare namespace Express {
    export interface Request {
        payload?: {
            username?: string;
            password?: string;
            what?: string;
            fav?: any;
        };
    }
}
