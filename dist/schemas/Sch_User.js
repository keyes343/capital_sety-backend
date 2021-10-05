"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
exports.User = new mongoose_1.Schema({
    username: { type: String, required: false, default: null },
    password: { type: String, required: false, default: null },
    favs: { type: [String], required: true },
}, { timestamps: true });
