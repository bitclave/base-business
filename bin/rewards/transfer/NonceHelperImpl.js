"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LocalStorage = require('node-localstorage').LocalStorage;
class NonceHelperImpl {
    constructor(web3, walletAddress) {
        this.STORAGE_PATH = "./storage";
        this.NONCE_KEY = "nonce";
        this.nonce = -1;
        this.web3 = web3;
        this.walletAddress = walletAddress;
        this.storage = new LocalStorage(this.STORAGE_PATH);
    }
    async getNonce() {
        this.nonce = (await this.storage.getItem(this.NONCE_KEY)) || -1;
        if (this.nonce == -1) {
            this.nonce = await this.web3.eth.getTransactionCount(this.walletAddress);
            await this.storage.setItem(this.NONCE_KEY, this.nonce);
        }
        return this.nonce;
    }
    async increaseNonce() {
        this.nonce = await this.getNonce();
        this.nonce++;
        await this.storage.setItem(this.NONCE_KEY, this.nonce);
        return this.nonce;
    }
}
exports.default = NonceHelperImpl;
//# sourceMappingURL=NonceHelperImpl.js.map