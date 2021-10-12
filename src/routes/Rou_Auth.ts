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
        // const token_new = req.headers['x-access-token'] as string | undefined;
        const token_new = req.body.token;
        console.log(`step 1 - _authenticate()_ - OK - start`);
        if (!token_new) {
            // console.log(`step 2 - _authenticate()_ - FAILED - no token found`);
            this.failed(res, 'no token found');
            return;
        }
        // console.log(`step 2 - _authenticate()_ - OK - token available in payload`);
        const decoded = jwt.verify(token_new, this.secret);
        // console.log(`step 3 - _authenticate()_ - OK - verify process done`);
        if (decoded) {
            // console.log(`step 4 - _authenticate()_ - OK - verify clear`);
            const { username, password } = decoded as any;
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
        } else {
            // console.log(`step 3 - _authenticate()_ - FAIL - verify BLOCKED`);
            res.status(401).send('Login expired');
        }
    };

    private initialize = () => {
        this.router.post('/login/:action', async (req: Request<{ action: 'getToken' | 'verify' }, {}, { username: string; password: string; token?: string }>, res: Response) => {
            const {
                body: { username, password },
                params: { action },
            } = req;
            console.log(`step 1 - _/login:action_ - OK - action = ${action}`);
            if (action === 'getToken' && (!username || !password)) {
                console.log(`step 2 - _/login:action_ - FAIL - username or password missing`);
                res.status(400).send({
                    msg: 'payload is missing username or password for /new',
                });
            }
            console.log(`step 2 - _/login:action_ - OK - username and password present`);

            const token = jwt.sign({ username, password }, this.secret, {
                expiresIn: 86400,
            });
            console.log(`step 3 - _/login:action_ - OK - token generated`);
            // console.log({ token });

            try {
                // check if user exists in database
                // console.log(`step 4 - _/login:action_ - OK - find user in database`);
                const found = await this.model_user.findOne({ username, password });
                if (found) {
                    // now verify
                    // console.log(`step 5 - _/login:action_ - OK - FOUND exists, simply login instead`);
                    this.success(res, {
                        msg: 'user exists',
                        token,
                        user: found,
                    });
                    return;
                }

                // console.log(`step 5 - _/login:action_ - OK - creating user in database`);
                // console.log('creating user in database');
                const created = await this.model_user.create({
                    username,
                    password,
                    favs: [],
                });
                if (created) {
                    // console.log(`step 6 - _/login:action_ - OK - successfully created`);
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
                const {
                    body: { what },
                } = req;
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
                    const { status, data } = (await axios.get(final_api)) as any;
                    console.log(`step 3 - _/getMovieData_ - OK - after axios call`);
                    if (data) {
                        console.log(`step 4 - _/getMovieData_ - OK - data present for ${what}`);
                        // const results = data.results.length;
                        console.log({ data });
                        this.success(res, data.results);
                    } else {
                        console.log(`step 4 - _/getMovieData_ - FAIL - failed to get data from tmdb`);
                        this.failed(res, 'failed to fetch movie data');
                    }
                } catch (error) {
                    console.log({ error });
                }
            }
        );
        this.router.post(
            '/getFavs',
            this.authenticate,
            async (
                req: Request<
                    {},
                    {},
                    {
                        // what: 'popular' | 'latest' | 'favs';
                    }
                >,
                res: Response
            ) => {
                const {
                    // body: { what },
                } = req;
                // console.log(`step 1 - _/getFavs - OK - start`);
                const site = 'https://api.themoviedb.org';
                const favs = (id: number) => `${site}/3/movie/${id}`;

                // console.log(`step 2 - _/getFavs - OK - logic for favorite section`);
                // fetch only favs
                const username = req.payload?.username;
                const password = req.payload?.password;
                if (username && password) {
                    // console.log(`step 2 - _fav movies_ - OK - grabbed username and password`);
                    const userDoc = await this.model_user.findOne({ username, password });
                    if (userDoc) {
                        // console.log(`step 3 - _fav movies_ - OK - user grabbed from database`);
                        const fav_ids = userDoc.favs;

                        // now get the movies of only these ids
                        let promises: Promise<any>[] = [];
                        fav_ids.forEach((id, i) => {
                            const id_num = parseInt(id, 10);
                            const link = favs(id_num) + '?api_key=afb8a329c7df90313dc254101c8b1823';
                            const result = axios.get(link);
                            console.log({ link });
                            promises.push(result);
                        });

                        // execute all promises
                        // console.log(`step 4 - _fav movies_ - OK - promises ready`);
                        const movies = await Promise.all(promises);
                        let movies_cleandata = movies.map((movie) => {
                            return movie.data;
                        });
                        // console.log(`step 5 - _fav movies_ - OK - promises executed`);
                        console.log({ movies_cleandata });
                        this.success(res, movies_cleandata);
                        return;
                    }
                } else {
                    console.log('username missing from req.payload');
                }

                // const moviedb = {
                //     popular: site + '/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sory_by=popularity.desc',
                //     latest: site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sort_by=primary_release_date.asc`,
                //     // favs : site + `/3/discover/movie/?api_key=afb8a329c7df90313dc254101c8b1823&sort_by=primary_release_date.asc`,
                // };
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

        this.router.post('/get_user_id', async (req: Request<{}, {}, { token: string }>, res: Response) => {
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
            const decoded = jwt.verify(token_exists, this.secret, async (err, decoded__) => {
                // console.log({ decoded__, err });
                if (decoded__) {
                    // console.log(`step 3 - _/get_user_id_ - OK - decoded__ successfully`);
                    const username = decoded__.username;
                    const password = decoded__.password;
                    try {
                        // console.log(`step 4 - _/get_user_id_ - OK - about to search in mongooses`);
                        const found = await this.model_user.findOne({
                            username,
                            password,
                        });
                        if (found) {
                            // console.log(`step 5 - _/get_user_id_ - OK - found successfully`);
                            // console.log({ found });
                            this.success(res, found);
                        } else {
                            console.log(`step 6 - _/get_user_id_ - FAIL - not found`);
                            this.failed(res, 'no user found with this username and password');
                        }
                    } catch (error) {
                        console.log('--------some error ------------');
                        console.log({ error });
                    }

                    // this.success(res,decoded.username)
                } else {
                    // console.log(`step 3 - _/get_user_id_ - FAIL - decoded fail`);
                    res.status(401).send('Login expired');
                }
            }) as any;
        });

        this.router.post('/authenticate', this.authenticate, async (req: Request<{}, {}, Partial<{}>>, res: Response) => {
            const {
                body: {},
                params: {},
            } = req;
            console.log(`step 1 - _/authenticate_ - OK - start`);
            const { payload } = req;
            const username = payload?.username;
            const password = payload?.password;
            if (username && password) {
                console.log(`step 2 - _/authenticate_ - OK - user found`);
                this.success(res, {
                    username: req.payload?.username,
                    password: req.payload?.password,
                });
            } else {
                console.log(`step 2 - _/authenticate_ - FAIL - user not found`);
                this.failed(res, 'username or password not found');
            }
        });
    };
}
