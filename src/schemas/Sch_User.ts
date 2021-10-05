import { Schema } from 'mongoose';
import { t } from './incoming';

export const User = new Schema<t.user.UserDocument>(
    {
        username: { type: String, required: false, default: null },
        password: { type: String, required: false, default: null },
        favs: { type: [String], required: true },
    },
    { timestamps: true }
);
