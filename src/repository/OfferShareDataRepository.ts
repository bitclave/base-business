import OfferShareData from "bitclave-base/repository/models/OfferShareData";

export interface OfferShareDataRepository {

    getShareData(owner: string, accepted: boolean): Promise<Array<OfferShareData>>

    acceptShareData(searchId: number): Promise<void>

}
