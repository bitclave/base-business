"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProdConfig {
    getEthereumNodeHost() {
        return 'https://mainnet.infura.io/R4kTXAgVNzEAjjRP3gvK';
    }
    getContractAddress() {
        return '0x1234567461d3f8db7496581774bd869c83d51c93';
    }
    getGasLimit() {
        return 4000000;
    }
    getGasPrice() {
        return 10000000000;
    }
    getNetworkId() {
        return 1;
    }
}
exports.default = ProdConfig;
//# sourceMappingURL=ProdConfig.js.map