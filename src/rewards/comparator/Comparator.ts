import Offer from "bitclave-base/repository/models/Offer";
import { OfferPrice } from 'bitclave-base/repository/models/OfferPrice';

export interface Comparator {

    compare(offer: Offer, clientData: Map<string, string>): Promise<Map<string, boolean>>;
    compareByOfferPrice(offerPrice: OfferPrice, clientData: Map<string, string>): Promise<Map<string, boolean>>;
    
}
