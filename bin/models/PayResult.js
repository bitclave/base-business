"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CompareResult_1 = __importDefault(require("./CompareResult"));
const Transaction_1 = __importDefault(require("../rewards/transfer/Transaction"));
class PayResult {
    constructor(compareResult = new CompareResult_1.default(), transaction = new Transaction_1.default(), accepted = false) {
        this.compareResult = compareResult;
        this.transaction = transaction;
        this.accepted = accepted;
    }
}
exports.default = PayResult;
//# sourceMappingURL=PayResult.js.map