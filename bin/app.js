"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Business_1 = __importDefault(require("./Business"));
const express = require('express');
express().listen(process.env.PORT || 3000);
const business = new Business_1.default();
//# sourceMappingURL=app.js.map