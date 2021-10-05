import express, {Application} from 'express';
import cors from 'cors';
import { router } from './router';
// import { passport } from './passport';

// import { User } from './router';


class App {
    public app: Application;
    constructor(){
        this.app = express();
        this.setConfig();
    }

    private setConfig() {
        // Allows us to receive requests with data in json format
        this.app.use(express.json({limit: '50mb'}));
        // Allows us to receive requests with data in x-www-form-urlencoded format
        this.app.use(express.urlencoded({ limit: '50mb', extended:true}))
        this.app.use(cors());
        this.app.use('/', router);
        // this.app.use(new CookieSession().cookie);
        // this.app.use(passport.initialize());
        // this.app.use(passport.session());
    }
}

export default new App().app;
// tutorial for typescript with node and express
// https://dev.to/nyagarcia/pokeapi-rest-in-nodejs-with-express-typescript-mongodb-and-docker-part-1-5f8g