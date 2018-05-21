import Base, {OfferSearchResultItem} from 'bitclave-base';
import Account from 'bitclave-base/repository/models/Account';

import {OfferShareDataRepository} from "./repository/OfferShareDataRepository";
import {Comparator} from "./comparator/Comparator";
import OfferShareData from "bitclave-base/repository/models/OfferShareData";
import {OfferSearchRepository} from "./repository/OfferSearchRepository";

export default class WorthValidator {

    private offerShareDataRepository: OfferShareDataRepository;
    private offerSearchRepository: OfferSearchRepository;
    private base: Base;
    private comparator: Comparator;

    constructor(offerShareDataRepository: OfferShareDataRepository,
                offerSearchRepository: OfferSearchRepository,
                base: Base,
                account: Account,
                comparator: Comparator) {

        this.offerShareDataRepository = offerShareDataRepository;
        this.offerSearchRepository = offerSearchRepository;
        this.base = base;
        this.comparator = comparator;

        this.syncDataShareWithDelay(account.publicKey);
    }

    private syncDataShareWithDelay(businessPublicKey: string) {
        console.log('wait before sync');
        setTimeout(() => this.syncShareData(businessPublicKey), 10000)
    }

    private async syncShareData(businessPublicKey: string) {
        console.log('sync process...');
        this.offerShareDataRepository
            .getShareData(businessPublicKey, false)
            .then((result: Array<OfferShareData>) => result.map(this.getCompareData.bind(this)))
            .then(promise => {
                return Promise.all(promise)
            })
            .then(() => {
                console.log('check shared data success');
                this.syncDataShareWithDelay(businessPublicKey);
            })
            .catch(reason => {
                console.log('get error:', reason);
                this.syncDataShareWithDelay(businessPublicKey);
            })
    }

    private async getCompareData(offerShareData: OfferShareData): Promise<void> {
        const clientData: Map<string, string> = await this.base
            .profileManager
            .getAuthorizedData(offerShareData.clientId, offerShareData.clientResponse);

        const searchResult: OfferSearchResultItem = await this.offerSearchRepository
            .getOfferSearchItem(
                offerShareData.clientId,
                offerShareData.offerSearchId
            );

        const compareResult: Map<string, boolean> = await this.comparator
            .compare(searchResult.offer, clientData);

        const compareKeys: Array<boolean> = Array.from(compareResult.values());
        const countOfValid: number = compareKeys
            .filter(value => value === true).length;

        console.log(`worth for client: ${offerShareData.clientId} is ${(countOfValid / compareKeys.length) * 100}%`);
    }

}
