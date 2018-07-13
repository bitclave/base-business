import { Comparator } from './Comparator';
import Offer from 'bitclave-base/repository/models/Offer';
import { CompareAction } from 'bitclave-base';

export default class ComparatorImpl implements Comparator {

    async compare(offer: Offer, clientData: Map<string, string>): Promise<Map<string, boolean>> {
        const result: Map<string, boolean> = new Map();

        for (let [key, value] of offer.rules.entries()) {
            const clientValue: string | undefined = clientData.get(key.toString());
            let compareResult: boolean = false;

            try {
                compareResult = clientValue != undefined && this.compareField(CompareAction[value.toString()], clientValue, offer.compare.get(key));
            } catch (e) {
                console.log('compare error!', e);
            }

            result.set(key.toString(), compareResult);
        }

        return result;
    }

    private compareField(compareAction: CompareAction, clientValue: string, offerCompareValue): boolean {
        switch (compareAction) {
            case CompareAction.EQUALLY:
                return clientValue == offerCompareValue;

            case CompareAction.NOT_EQUAL:
                return clientValue != offerCompareValue;

            case CompareAction.MORE:
                return parseFloat(clientValue) > parseFloat(offerCompareValue);

            case CompareAction.MORE_OR_EQUAL:
                return parseFloat(clientValue) >= parseFloat(offerCompareValue);

            case CompareAction.LESS:
                return parseFloat(clientValue) < parseFloat(offerCompareValue);

            case CompareAction.LESS_OR_EQUAL:
                return parseFloat(clientValue) <= parseFloat(offerCompareValue);

            default :
                return false;
        }

    }

}
