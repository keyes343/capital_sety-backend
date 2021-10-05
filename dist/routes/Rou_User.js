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
exports.User = void 0;
const express_1 = __importDefault(require("express"));
class User {
    constructor(user) {
        this.initialize = () => {
            // WHEN FRONTEND RECEIVES A LOGIN, TRY TO ACKNOWLEDGE USER INTO DATABASE
            this.router.post('/acknowledge', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { email, uid } = req.body;
                if (!email) {
                    res.status(400).send('Email doesnt exist in payload');
                }
                try {
                    const found_email = yield this.model_user.findOne({ email });
                    if (found_email) {
                        console.log('Email exists');
                        // now check if 'email' or
                        res.send({
                            msg: 'email exists',
                            doc: found_email,
                        });
                    }
                    else {
                        console.log(`Email deosnt exist for - ${email}`);
                        const created = yield this.model_user.create({
                            email: email !== null && email !== void 0 ? email : null,
                            uid,
                        });
                        if (created) {
                            console.log('Email created');
                            res.send({
                                msg: 'created',
                                doc: created,
                            });
                        }
                        else {
                            console.log('Email failed');
                            res.send({
                                msg: 'failed',
                                doc: null,
                            });
                        }
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
        };
        this.model_user = user;
        this.router = express_1.default.Router();
        this.initialize();
    }
}
exports.User = User;
