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
exports.Med = void 0;
const express_1 = __importDefault(require("express"));
class Med {
    constructor(med, user) {
        this.initialize = () => {
            this.router.post('/new', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body } = req;
                if (!body) {
                    res.status(400).send({
                        msg: 'payload is missing something for /new',
                    });
                }
                // const { name, owner, quantity, med_type, start, end, time_of_day, meal } = body;
                try {
                    const created = yield this.model_med.create(Object.assign({}, body));
                    if (created) {
                        res.status(200).send({
                            msg: 'created',
                            doc: created,
                        });
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
            this.router.post('/get_my_meds', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body: { date, _id }, } = req;
                if (!_id) {
                    res.status(400).send({
                        msg: 'user id missing for /get_my_meds',
                    });
                }
                try {
                    const docs = yield this.model_med.find({
                        owner: _id,
                        start: {
                            $lte: date,
                        },
                        end: {
                            $gte: date,
                        },
                    });
                    if (!!docs.length) {
                        res.status(200).send({
                            msg: 'empty result',
                            docs: docs,
                        });
                    }
                    else {
                        res.status(200).send({
                            msg: 'docs sent',
                            docs: false,
                        });
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
            this.router.post('/toggle_taken', (req, res) => __awaiter(this, void 0, void 0, function* () {
                const { body: { date_text, _id }, } = req;
                if (!date_text || !_id) {
                    res.status(400).send({
                        msg: 'date not present in payload',
                    });
                    return;
                }
                try {
                    const found = yield this.model_med.findById({ _id });
                    if (found) {
                        // see if payload date exists
                        const indx = found.taken.indexOf(date_text);
                        if (indx > -1) {
                            // remove it
                            found.taken.splice(indx, 1);
                        }
                        else {
                            found.taken.push(date_text);
                        }
                        yield found.save();
                        res.status(200).send({
                            msg: 'Toggled taken med',
                            doc: found,
                        });
                    }
                }
                catch (error) {
                    console.log({ error });
                }
            }));
        };
        this.model_med = med;
        this.model_user = user;
        this.router = express_1.default.Router();
        this.initialize();
    }
}
exports.Med = Med;
