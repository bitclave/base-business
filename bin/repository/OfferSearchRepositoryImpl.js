"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitclave_base_1 = require("bitclave-base");
const fetch = require("node-fetch");
class OfferSearchRepositoryImpl {
    constructor(host) {
        // private readonly OFFER_SEARCH_API = '/v1/client/{clientId}/search/result/?searchResultId={searchResultId}';
        this.OFFER_SEARCH_API = '/v1/search/result/?offerSearchId={searchResultId}';
        this.host = host;
    }
    async getOfferSearchItem(clientId, searchResultId) {
        // const url = this.host + this.OFFER_SEARCH_API
        //     .replace('{clientId}', clientId)
        //     .replace('{searchResultId}', searchResultId.toString());
        const url = this.host + this.OFFER_SEARCH_API
            .replace('{searchResultId}', searchResultId.toString());
        const response = await fetch(url, { method: 'GET' });
        const json = await response.json();
        const result = this.jsonToListResult(json);
        return result[0];
    }
    jsonToListResult(json) {
        const result = [];
        for (let item of json) {
            result.push(new bitclave_base_1.OfferSearchResultItem(Object.assign(new bitclave_base_1.OfferSearch(), item['offerSearch']), bitclave_base_1.Offer.fromJson(item['offer'])));
        }
        return result;
    }
}
exports.default = OfferSearchRepositoryImpl;
//# sourceMappingURL=OfferSearchRepositoryImpl.js.map