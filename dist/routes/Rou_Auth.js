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
            const token_new = req.headers['x-access-token'];
            if (!token_new) {
                this.failed(res, 'no token found');
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token_new, this.secret);
            if (decoded) {
                console.log({
                    decoded,
                });
                next();
            }
            else {
                res.status(401).send('Login expired');
            }
        };
        this.initialize = () => {
            this.router.post('/login/:action', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body: { username, password }, params: { action }, } = req;
                console.log({ username, password, action });
                console.log({
                    header: req.headers,
                });
                if (action === 'getToken' && (!username || !password)) {
                    console.log('Failed ----');
                    res.status(400).send({
                        msg: 'payload is missing username or password for /new',
                    });
                }
                const token = jsonwebtoken_1.default.sign({ username, password }, this.secret, {
                    expiresIn: 86400,
                });
                console.log({ token });
                try {
                    // check if user exists in database
                    const found = yield this.model_user.findOne({ username, password });
                    if (found) {
                        this.success(res, {
                            msg: 'user exists',
                            token,
                            user: found,
                        });
                        return;
                    }
                    console.log('creating user in database');
                    const created = yield this.model_user.create({
                        username,
                        password,
                        favs: [],
                    });
                    if (created) {
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
            this.router.post('/getMovieData', 
            // this.authenticate,
            (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body } = req;
                const site = 'https://api.themoviedb.org';
                const moviedb = {
                    popular: site + '/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823',
                    latest: site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823`,
                };
                try {
                    const { status, data } = (yield axios_1.default.get(moviedb[body.what]));
                    if (data) {
                        // console.log({ data, status });
                        // set_list([...data]);
                        console.log('movie api success', body.what);
                        this.success(res, data);
                    }
                    else {
                        console.log('movie api failed');
                        this.failed(res, 'failed to fetch movie data');
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
            this.router.post('/favs/:action', this.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body: { mongoose_id, card_id }, params: { action }, } = req;
                console.log('/auth/fav/action = ', action);
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
            this.router.get('/get_user_id', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body, params } = req;
                const token_new = req.headers['x-access-token'];
                if (!token_new) {
                    this.failed(res, 'no token found');
                    return;
                }
                const decoded = jsonwebtoken_1.default.verify(token_new, this.secret);
                if (decoded) {
                    const username = decoded.username;
                    const password = decoded.password;
                    try {
                        const found = yield this.model_user.findOne({
                            username,
                            password,
                        });
                        if (found) {
                            this.success(res, found);
                        }
                        else {
                            this.failed(res, 'no user found with this username and password');
                        }
                    }
                    catch (error) {
                        console.log({ error });
                    }
                    // this.success(res,decoded.username)
                }
                else {
                    res.status(401).send('Login expired');
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
