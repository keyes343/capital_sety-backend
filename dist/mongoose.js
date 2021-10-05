"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongooseDatabase = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const routes = __importStar(require("./routes/index"));
const schemas = __importStar(require("./schemas/index"));
class MongooseDatabase {
    constructor() {
        this.initializeMongoose = () => __awaiter(this, void 0, void 0, function* () {
            const uri_auth = 'mongodb+srv://jeet343:jeet419@cluster0.vh99l.mongodb.net/capital_setu?retryWrites=true&w=majority';
            try {
                yield this.db.connect(uri_auth, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                    useCreateIndex: true,
                });
                console.log('beep beep');
            }
            catch (error) {
                console.log(error);
            }
        });
        this.db = mongoose_1.default;
        this.initializeMongoose();
        // USER
        this.User_model = (0, mongoose_1.model)('user', schemas.User); // define a model
        this.User = new routes.User(this.User_model).router; // invoking the class by passing in a model
        // Med
        this.Auth_model = (0, mongoose_1.model)('auth', schemas.Auth);
        this.Auth = new routes.Auth(this.Auth_model, this.User_model).router;
    }
}
exports.MongooseDatabase = MongooseDatabase;
