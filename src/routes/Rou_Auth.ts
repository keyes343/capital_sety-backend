import express, { Router, Request, Response, NextFunction } from 'express';
import mongoose, { Schema, model, Model, Document } from 'mongoose';
import { t } from './incoming';
import jwt from 'jsonwebtoken';
import axios from 'axios';

export class Auth {
    model_auth: Model<t.auth.AuthDocument>;
    model_user: Model<t.user.UserDocument>;
    router: Router;
    secret: string;
    constructor(Auth: Model<t.auth.AuthDocument>, user: Model<t.user.UserDocument>) {
        this.secret = 'lemonisgood';
        this.model_auth = Auth;
        this.model_user = user;
        this.router = express.Router();
        this.initialize();
    }

    private success = (res: Response, payload: any) => {
        res.status(200).send(payload);
    };
    private failed = (res: Response, msg: string) => {
        res.status(400).send(msg);
    };

    private authenticate = (req: Request, res: Response, next: NextFunction) => {
        const token_new = req.headers['x-access-token'] as string | undefined;
        if (!token_new) {
            this.failed(res, 'no token found');
            return;
        }
        const decoded = jwt.verify(token_new, this.secret);
        if (decoded) {
            console.log({
                decoded,
            });

            next();
        } else {
            res.status(401).send('Login expired');
        }
    };

    private initialize = () => {
        this.router.post('/login/:action', async (req: Request<{ action: 'getToken' | 'verify' }, {}, { username: string; password: string; token?: string }>, res: Response) => {
            const {
                body: { username, password },
                params: { action },
            } = req;
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

            const token = jwt.sign({ username, password }, this.secret, {
                expiresIn: 86400,
            });
            console.log({ token });

            try {
                // check if user exists in database
                const found = await this.model_user.findOne({ username, password });
                if (found) {
                    this.success(res, {
                        msg: 'user exists',
                        token,
                        user: found,
                    });
                    return;
                }

                console.log('creating user in database');
                const created = await this.model_user.create({
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
                } else {
                    this.failed(res, 'user cudnt be added to mongoose');
                }
            } catch (error) {
                console.log({ error });
            }
        });

        // this.router.post('/save', this.authenticate, async (req: Request<{}, {}, {}>, res: Response) => {});
        this.router.post(
            '/getMovieData',
            // this.authenticate,
            async (
                req: Request<
                    {},
                    {},
                    {
                        what: 'popular' | 'latest';
                    }
                >,
                res: Response
            ) => {
                const { body } = req;
                const site = 'https://api.themoviedb.org';
                const moviedb = {
                    popular: site + '/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823',
                    latest: site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823`,
                };

                try {
                    const { status, data } = (await axios.get(moviedb[body.what])) as any;
                    if (data) {
                        // console.log({ data, status });
                        // set_list([...data]);
                        console.log('movie api success', body.what);
                        this.success(res, data);
                    } else {
                        console.log('movie api failed');
                        this.failed(res, 'failed to fetch movie data');
                    }
                } catch (error) {
                    console.log({ error });
                }
            }
        );
        this.router.post(
            '/favs/:action',
            this.authenticate,
            async (
                req: Request<
                    {
                        action: 'add' | 'remove';
                    },
                    {},
                    {
                        mongoose_id: string;
                        card_id: string;
                    }
                >,
                res: Response
            ) => {
                const {
                    body: { mongoose_id, card_id },
                    params: { action },
                } = req;
                console.log('/auth/fav/action = ', action);

                if (!mongoose_id) {
                    console.log('failed, no mongoose id');
                    this.failed(res, 'no mongoose id');
                    return;
                }
                try {
                    console.log({ action, mongoose_id });

                    const userFound = await this.model_user.findById(mongoose_id);
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
                                await userFound.save();
                                break;
                            case 'remove':
                                console.log('removing');
                                const indx = favs.indexOf(card_id);
                                if (indx > -1) {
                                    favs.splice(indx, 1);
                                    userFound.favs = [...favs];
                                    await userFound.save();
                                    this.success(res, favs);
                                }
                                break;
                            default:
                                break;
                        }
                    } else {
                        console.log(`username not found`);

                        this.failed(res, 'no user found');
                    }
                } catch (error) {
                    console.log({ error });
                }
            }
        );

        this.router.get('/get_user_id', async (req: Request<{}, {}, {}>, res: Response) => {
            const { body, params } = req;

            const token_new = req.headers['x-access-token'] as string | undefined;
            if (!token_new) {
                this.failed(res, 'no token found');
                return;
            }
            const decoded = jwt.verify(token_new, this.secret) as any;
            if (decoded) {
                const username = decoded.username;
                const password = decoded.password;
                try {
                    const found = await this.model_user.findOne({
                        username,
                        password,
                    });
                    if (found) {
                        this.success(res, found);
                    } else {
                        this.failed(res, 'no user found with this username and password');
                    }
                } catch (error) {
                    console.log({ error });
                }

                // this.success(res,decoded.username)
            } else {
                res.status(401).send('Login expired');
            }
        });
    };
}
