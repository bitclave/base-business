import {OfferSearchResultItem} from "bitclave-base";

export interface OfferSearchRepository {

    getOfferSearchItem(clientId: string, searchResultId: number): Promise<OfferSearchResultItem>

}
