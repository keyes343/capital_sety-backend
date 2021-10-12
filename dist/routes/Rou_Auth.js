"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
class Auth {
    constructor(Auth, user) {
        this.success = (res, payload) => {
            res.status(200).send(payload);
        };
        this.failed = (res, msg) => {
            res.status(400).send(msg);
        };
        this.authenticate = (req, res, next) => {
            // const token_new = req.headers['x-access-token'] as string | undefined;
            const token_new = req.body.token;
            console.log(`step 1 - _authenticate()_ - OK - start`);
            if (!token_new) {
                // console.log(`step 2 - _authenticate()_ - FAILED - no token found`);
                this.failed(res, 'no token found');
                return;
            }
            // console.log(`step 2 - _authenticate()_ - OK - token available in payload`);
            const decoded = jsonwebtoken_1.default.verify(token_new, this.secret);
            // console.log(`step 3 - _authenticate()_ - OK - verify process done`);
            if (decoded) {
                // console.log(`step 4 - _authenticate()_ - OK - verify clear`);
                const { username, password } = decoded;
                // console.log({
                //     aa: 'aa',
                //     decoded,
                // });
                req.payload = {
                    username,
                    password,
                };
                // console.log(`step 5 - _authenticate()_ - OK - calling next()`);
                next();
            }
            else {
                // console.log(`step 3 - _authenticate()_ - FAIL - verify BLOCKED`);
                res.status(401).send('Login expired');
            }
        };
        this.initialize = () => {
            this.router.post('/login/:action', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body: { username, password }, params: { action }, } = req;
                console.log(`step 1 - _/login:action_ - OK - action = ${action}`);
                // console.log({ username, password, action });
                // console.log({
                //     header: req.headers,
                // });
                if (action === 'getToken' && (!username || !password)) {
                    console.log(`step 2 - _/login:action_ - FAIL - username or password missing`);
                    res.status(400).send({
                        msg: 'payload is missing username or password for /new',
                    });
                }
                console.log(`step 2 - _/login:action_ - OK - username and password present`);
                const token = jsonwebtoken_1.default.sign({ username, password }, this.secret, {
                    expiresIn: 86400,
                });
                console.log(`step 3 - _/login:action_ - OK - token generated`);
                // console.log({ token });
                try {
                    // check if user exists in database
                    console.log(`step 4 - _/login:action_ - OK - find user in database`);
                    const found = yield this.model_user.findOne({ username, password });
                    if (found) {
                        // now verify
                        console.log(`step 5 - _/login:action_ - OK - FOUND exists, simply login instead`);
                        this.success(res, {
                            msg: 'user exists',
                            token,
                            user: found,
                        });
                        return;
                    }
                    console.log(`step 5 - _/login:action_ - OK - creating user in database`);
                    console.log('creating user in database');
                    const created = yield this.model_user.create({
                        username,
                        password,
                        favs: [],
                    });
                    if (created) {
                        console.log(`step 6 - _/login:action_ - OK - successfully created`);
                        this.success(res, {
                            msg: 'token generated',
                            token,
                            mongoose_id: created._id,
                        });
                    }
                    else {
                        this.failed(res, 'user cudnt be added to mongoose');
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
            // this.router.post('/save', this.authenticate, async (req: Request<{}, {}, {}>, res: Response) => {});
            this.router.post('/getMovieData', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body: { what }, } = req;
                console.log({ body: req.body });
                if (!what) {
                    console.log(`step 1 - _/getMovieData_ - FAIL - what not present in payload`);
                    return;
                }
                console.log(`step 1 - _/getMovieData_ - OK - start`);
                const site = 'https://api.themoviedb.org';
                const moviedb = {
                    popular: site + '/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sory_by=popularity.desc',
                    latest: site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sort_by=primary_release_date.asc`,
                    // favs : site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sort_by=primary_release_date.asc`,
                };
                // const favs = (id: number) => `${site}/3/movie/${id}`;
                try {
                    console.log(`step 2 - _/getMovieData_ - OK - not for favorite section`);
                    const final_api = moviedb[what];
                    console.log({ final_api, what });
                    const { status, data } = (yield axios_1.default.get(final_api));
                    console.log(`step 3 - _/getMovieData_ - OK - after axios call`);
                    if (data) {
                        console.log(`step 4 - _/getMovieData_ - OK - data present for ${what}`);
                        // const results = data.results.length;
                        console.log({ data });
                        this.success(res, data.results);
                    }
                    else {
                        console.log(`step 4 - _/getMovieData_ - FAIL - failed to get data from tmdb`);
                        this.failed(res, 'failed to fetch movie data');
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
            this.router.post('/getFavs', this.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const {} = req;
                // console.log(`step 1 - _/getFavs - OK - start`);
                const site = 'https://api.themoviedb.org';
                const favs = (id) => `${site}/3/movie/${id}`;
                // console.log(`step 2 - _/getFavs - OK - logic for favorite section`);
                // fetch only favs
                const username = (_a = req.payload) === null || _a === void 0 ? void 0 : _a.username;
                const password = (_b = req.payload) === null || _b === void 0 ? void 0 : _b.password;
                if (username && password) {
                    // console.log(`step 2 - _fav movies_ - OK - grabbed username and password`);
                    const userDoc = yield this.model_user.findOne({ username, password });
                    if (userDoc) {
                        // console.log(`step 3 - _fav movies_ - OK - user grabbed from database`);
                        const fav_ids = userDoc.favs;
                        // now get the movies of only these ids
                        let promises = [];
                        fav_ids.forEach((id, i) => {
                            const id_num = parseInt(id, 10);
                            const link = favs(id_num) + '?api_key=afb8a329c7df90313dc254101c8b1823';
                            const result = axios_1.default.get(link);
                            console.log({ link });
                            promises.push(result);
                        });
                        // execute all promises
                        // console.log(`step 4 - _fav movies_ - OK - promises ready`);
                        const movies = yield Promise.all(promises);
                        let movies_cleandata = movies.map((movie) => {
                            return movie.data;
                        });
                        // console.log(`step 5 - _fav movies_ - OK - promises executed`);
                        console.log({ movies_cleandata });
                        this.success(res, movies_cleandata);
                        return;
                    }
                }
                else {
                    console.log('username missing from req.payload');
                }
                // const moviedb = {
                //     popular: site + '/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sory_by=popularity.desc',
                //     latest: site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sort_by=primary_release_date.asc`,
                //     // favs : site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sort_by=primary_release_date.asc`,
                // };
            }));
            this.router.post('/favs/:action', this.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body: { mongoose_id, card_id }, params: { action }, } = req;
                console.log(`step 1 - _/fav/:action_ - OK - start`);
                console.log('action = ', action);
                console.log({ body: req.body });
                if (!mongoose_id) {
                    console.log('failed, no mongoose id');
                    this.failed(res, 'no mongoose id');
                    return;
                }
                try {
                    console.log({ action, mongoose_id });
                    const userFound = yield this.model_user.findById(mongoose_id);
                    if (userFound) {
                        // console.log(`username = ${userFound.username} is found`);
                        let favs = userFound.favs;
                        switch (action) {
                            case 'add':
                                console.log('adding');
                                favs.push(card_id);
                                console.log({ favs });
                                this.success(res, favs);
                                userFound.favs = [...favs];
                                yield userFound.save();
                                break;
                            case 'remove':
                                console.log('removing');
                                const indx = favs.indexOf(card_id);
                                if (indx > -1) {
                                    favs.splice(indx, 1);
                                    userFound.favs = [...favs];
                                    yield userFound.save();
                                    this.success(res, favs);
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        console.log(`username not found`);
                        this.failed(res, 'no user found');
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
            this.router.post('/get_user_id', (req, res) => __awaiter(this, void 0, void 0, function* () {
                console.log(`step 1 - _/get_user_id_ - OK - start`);
                const { body, params } = req;
                const token_exists = body.token;
                console.log({ body: req.body });
                // const token_exists = req.headers['x-access-token'] as string | undefined;
                if (!token_exists) {
                    console.log(`step 2 - _/get_user_id_ - FAIL - token not found`);
                    this.failed(res, 'no token found');
                    return;
                }
                // console.log(`step 2 - _/get_user_id_ - OK - token found in payload`);
                const decoded = jsonwebtoken_1.default.verify(token_exists, this.secret, (err, decoded__) => __awaiter(this, void 0, void 0, function* () {
                    // console.log({ decoded__, err });
                    if (decoded__) {
                        // console.log(`step 3 - _/get_user_id_ - OK - decoded__ successfully`);
                        const username = decoded__.username;
                        const password = decoded__.password;
                        try {
                            // console.log(`step 4 - _/get_user_id_ - OK - about to search in mongooses`);
                            const found = yield this.model_user.findOne({
                                username,
                                password,
                            });
                            if (found) {
                                // console.log(`step 5 - _/get_user_id_ - OK - found successfully`);
                                // console.log({ found });
                                this.success(res, found);
                            }
                            else {
                                console.log(`step 6 - _/get_user_id_ - FAIL - not found`);
                                this.failed(res, 'no user found with this username and password');
                            }
                        }
                        catch (error) {
                            console.log('--------some error ------------');
                            console.log({ error });
                        }
                        // this.success(res,decoded.username)
                    }
                    else {
                        // console.log(`step 3 - _/get_user_id_ - FAIL - decoded fail`);
                        res.status(401).send('Login expired');
                    }
                }));
            }));
            this.router.post('/authenticate', this.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
                var _c, _d;
                const { body: {}, params: {}, } = req;
                console.log(`step 1 - _/authenticate_ - OK - start`);
                const { payload } = req;
                const username = payload === null || payload === void 0 ? void 0 : payload.username;
                const password = payload === null || payload === void 0 ? void 0 : payload.password;
                if (username && password) {
                    console.log(`step 2 - _/authenticate_ - OK - user found`);
                    this.success(res, {
                        username: (_c = req.payload) === null || _c === void 0 ? void 0 : _c.username,
                        password: (_d = req.payload) === null || _d === void 0 ? void 0 : _d.password,
                    });
                }
                else {
                    console.log(`step 2 - _/authenticate_ - FAIL - user not found`);
                    this.failed(res, 'username or password not found');
                }
            }));
        };
        this.secret = 'lemonisgood';
        this.model_auth = Auth;
        this.model_user = user;
        this.router = express_1.default.Router();
        this.initialize();
    }
}
exports.Auth = Auth;
