"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
// import mongoose, { Schema, model, Model, Document } from 'mongoose';
// import app from './index';
// import * as routes from './routes/index';
// import * as t from './types/index';
const mongoose_1 = require("./mongoose");
class ExpressRouter {
    // db: typeof mongoose;
    // Sub-Routers
    // User: Router;
    constructor() {
        this.routes = () => {
            this.router.post('/name', (req, res) => {
                res.send({
                    name: 'working fine',
                });
            });
        };
        this.router = express_1.default.Router();
        this.MongooseInstance = new mongoose_1.MongooseDatabase(); // initializing Main-Mongoose class
        // this.db = this.MongooseInstance.db; // do something with this if needed
        // creating routes
        this.router.use('/user', this.MongooseInstance.User); // assigning path for router extension
        this.router.use('/auth', this.MongooseInstance.Auth);
        this.routes(); // invoking the Main Route
    }
}
const InitializeExpressRouter = new ExpressRouter(); // initializing the main class inside this file
exports.router = InitializeExpressRouter.router; // this will be used by the main express app for routing
