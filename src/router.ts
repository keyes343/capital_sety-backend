import express, { Router, Request, Response, NextFunction } from 'express';
// import mongoose, { Schema, model, Model, Document } from 'mongoose';
// import app from './index';
// import * as routes from './routes/index';
// import * as t from './types/index';

import { MongooseDatabase } from './mongoose';

class ExpressRouter {
    // MAIN ROUTER FOR THIS ENTIRE APP
    router: Router;
    MongooseInstance: MongooseDatabase;
    // db: typeof mongoose;
    // Sub-Routers
    // User: Router;

    constructor() {
        this.router = express.Router();
        this.MongooseInstance = new MongooseDatabase(); // initializing Main-Mongoose class
        // this.db = this.MongooseInstance.db; // do something with this if needed

        // creating routes
        this.router.use('/user', this.MongooseInstance.User); // assigning path for router extension
        this.router.use('/auth', this.MongooseInstance.Auth);
        this.routes(); // invoking the Main Route
    }

    private routes = () => {
        this.router.post('/name', (req: Request, res: Response) => {
            res.send({
                name: 'working fine',
            });
        });
    };
}
const InitializeExpressRouter = new ExpressRouter(); // initializing the main class inside this file
export const router = InitializeExpressRouter.router; // this will be used by the main express app for routing
