"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProdConfig {
    getEthereumNodeHost() {
        return 'https://mainnet.infura.io/R4kTXAgVNzEAjjRP3gvK';
    }
    getContractAddress() {
        return '0x0';
    }
    getGasLimit() {
        return 4000000;
    }
    getGasPrice() {
        return 1000000000;
    }
    getNetworkId() {
        return 1;
    }
}
exports.default = ProdConfig;
//# sourceMappingURL=ProdConfig.js.map