"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const mongoose_1 = require("mongoose");
exports.Auth = new mongoose_1.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'user' },
    quantity: { type: Number, required: true },
    med_type: { type: String, enums: ['Syrup', 'Tablet', 'Lotion', 'others'], required: true },
    start: Date,
    end: Date,
    time_of_day: { type: String, enums: ['Morning', 'Afternoon', 'Evening', 'Night'], required: true },
    meal: { type: String, enums: ['After', 'Before'], required: true },
    taken: [String],
}, { timestamps: true });
