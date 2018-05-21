import {OfferShareDataRepository} from "./OfferShareDataRepository";
import {OfferShareData} from "bitclave-base";
const fetch = require("node-fetch");

export default class OfferShareDataRepositoryImpl implements OfferShareDataRepository {

    private readonly SHARE_DATA_API: string = "/v1/data/offer/?owner={owner}&accepted={accepted}";

    private host: string;

    constructor(host: string) {
        this.host = host;
    }

    async getShareData(owner: string, accepted: boolean): Promise<Array<OfferShareData>> {
        const url: string = this.host + this.SHARE_DATA_API
            .replace('{owner}', owner)
            .replace('{accepted}', accepted.toString());

        const response = await fetch(url, {method: 'GET'});
        const json = await response.json();
        const result: Array<OfferShareData> = [];

        for (let item of json) {
            result.push(Object.assign(new OfferShareData(0, ''), item))
        }

        return result;
    }

    async acceptShareData(searchId: number): Promise<void> {

    }

}
