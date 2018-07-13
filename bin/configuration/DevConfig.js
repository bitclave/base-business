"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DevConfig {
    getEthereumNodeHost() {
        return 'https://ropsten.infura.io/R4kTXAgVNzEAjjRP3gvK';
    }
    getContractAddress() {
        return '0x56c38d117f92ed0501a9f7ee39abf9089988b6e0';
    }
    getGasLimit() {
        return 4000000;
    }
    getGasPrice() {
        return 1000000000;
    }
    getNetworkId() {
        return 3;
    }
}
exports.default = DevConfig;
//# sourceMappingURL=DevConfig.js.map