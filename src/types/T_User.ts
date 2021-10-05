import { Document } from 'mongoose';

export type User = {
    username: string | null;
    password: string;
    favs: string[];
};

export interface UserDocument extends User, Document {}
