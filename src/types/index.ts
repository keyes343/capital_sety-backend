import { Document } from 'mongoose';

import * as user from './T_User';
import * as auth from './T_Auth';

export { user, auth };

export type Url_storage = {
    url: string;
    fileName: string;
    deleteKey: string;
    bucket: string;
    dateCreated: Date;
    size: number;
};
