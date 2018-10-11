"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ProdConfig_1 = __importDefault(require("./ProdConfig"));
const DevConfig_1 = __importDefault(require("./DevConfig"));
class ConfigProxy {
    constructor() {
        this.config = (process.env.NODE_ENV === 'production') ? new ProdConfig_1.default() : new DevConfig_1.default();
    }
    getEthereumNodeHost() {
        return this.config.getEthereumNodeHost();
    }
    getContractAddress() {
        return this.config.getContractAddress();
    }
    getGasLimit() {
        return this.config.getGasLimit();
    }
    getGasPrice() {
        return this.config.getGasPrice();
    }
    getNetworkId() {
        return this.config.getNetworkId();
    }
}
exports.default = ConfigProxy;
//# sourceMappingURL=ConfigProxy.js.map