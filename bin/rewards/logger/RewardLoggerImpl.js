"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PayResult_1 = __importDefault(require("../../models/PayResult"));
const CompareResult_1 = __importDefault(require("../../models/CompareResult"));
const Transaction_1 = __importDefault(require("../transfer/Transaction"));
const LocalStorage = require('node-localstorage').LocalStorage;
class RewardLoggerImpl {
    constructor() {
        this.LOG_PATH = "./storage";
        this.PAY_RESULT_KEY = "payresults";
        this.storage = new LocalStorage(this.LOG_PATH);
    }
    async getLogs() {
        let result;
        try {
            result = JSON.parse(await this.storage.getItem(this.PAY_RESULT_KEY));
        }
        catch (e) {
            result = [];
        }
        return (result || []).map(value => {
            const payResult = Object.assign(new PayResult_1.default(), value);
            payResult.compareResult = Object.assign(new CompareResult_1.default(), value.compareResult);
            payResult.transaction = Object.assign(new Transaction_1.default(), value.transaction);
            return payResult;
        });
    }
    async saveLogs(items) {
        await this.storage.setItem(this.PAY_RESULT_KEY, JSON.stringify(items));
    }
}
exports.default = RewardLoggerImpl;
//# sourceMappingURL=RewardLoggerImpl.js.map