"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitclave_base_1 = require("bitclave-base");
const fetch = require("node-fetch");
class OfferShareDataRepositoryImpl {
    constructor(host, base) {
        this.SHARE_DATA_API = "/v1/data/offer/";
        this.NONCE_DATA_API = "/v1/nonce/";
        this.host = host;
        this.base = base;
    }
    async getShareData(owner, accepted) {
        const url = this.host + this.SHARE_DATA_API +
            `?owner=${owner}&accepted=${accepted.toString()}`;
        const response = await fetch(url, { method: 'GET' });
        const json = await response.json();
        const result = [];
        for (let item of json) {
            result.push(Object.assign(new bitclave_base_1.OfferShareData(0, ''), item));
        }
        return result;
    }
    async acceptShareData(searchId, worth) {
        const publicKey = this.base
            .accountManager
            .getAccount()
            .publicKey;
        const nonceUrl = this.host + this.NONCE_DATA_API + publicKey;
        const nonceResponse = await fetch(nonceUrl, { method: 'GET' });
        let nonce = parseInt(await nonceResponse.json());
        const acceptUrl = this.host + this.SHARE_DATA_API + `?offerSearchId=${searchId}`;
        const data = {
            data: worth,
            pk: publicKey,
            sig: await this.base.profileManager.signMessage(worth),
            nonce: ++nonce
        };
        await fetch(acceptUrl, {
            headers: { 'Content-Type': 'application/json' },
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
}
exports.default = OfferShareDataRepositoryImpl;
//# sourceMappingURL=OfferShareDataRepositoryImpl.js.map