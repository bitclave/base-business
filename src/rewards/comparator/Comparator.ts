import { Offer, OfferPrice, CompareAction } from  '@bitclave/base-client-js';

export interface Comparator {

    compare(offer: Offer, clientData: Map<string, string>): Promise<Map<string, boolean>>;
    compareByOfferPrice(offerPrice: OfferPrice, clientData: Map<string, string>): Promise<Map<string, boolean>>;
    
}
