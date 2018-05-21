import Offer from "bitclave-base/repository/models/Offer";

export interface Comparator {

    compare(offer: Offer, clientData: Map<string, string>): Promise<Map<string, boolean>>;

}
