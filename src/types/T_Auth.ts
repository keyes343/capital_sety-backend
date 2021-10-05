import { Document } from 'mongoose';

export type Auth = {
    username: string;
    password: string;
};

export interface AuthDocument extends Auth, Document {}
