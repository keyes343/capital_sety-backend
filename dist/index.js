"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router_1 = require("./router");
// import { passport } from './passport';
// import { User } from './router';
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.setConfig();
    }
    setConfig() {
        // Allows us to receive requests with data in json format
        this.app.use(express_1.default.json({ limit: '50mb' }));
        // Allows us to receive requests with data in x-www-form-urlencoded format
        this.app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
        this.app.use((0, cors_1.default)());
        this.app.use('/', router_1.router);
        // this.app.use(new CookieSession().cookie);
        // this.app.use(passport.initialize());
        // this.app.use(passport.session());
    }
}
exports.default = new App().app;
// tutorial for typescript with node and express
// https://dev.to/nyagarcia/pokeapi-rest-in-nodejs-with-express-typescript-mongodb-and-docker-part-1-5f8g
