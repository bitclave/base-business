import { Comparator } from './Comparator';
import Offer from 'bitclave-base/repository/models/Offer';
import { OfferPrice } from 'bitclave-base/repository/models/OfferPrice';
import { CompareAction } from 'bitclave-base';

export default class ComparatorImpl implements Comparator {

    async compare(offer: Offer, clientData: Map<string, string>): Promise<Map<string, boolean>> {
        const result: Map<string, boolean> = new Map();

        for (let [key, value] of offer.rules.entries()) {
            const clientValue: string | undefined = clientData.get(key.toString());
            let compareResult: boolean = false;

            try {
                const compareAction: CompareAction = this.convertToCompareAction(value.toString());
                const offerCompare = offer.compare.get(key);
                if (!offerCompare) {
                  throw new Error('offer compare is empty');
                }
                compareResult = clientValue != undefined && this.compareField(compareAction, clientValue, offerCompare.toString());
            } catch (e) {
                console.log('compare error!', e);
            }

            result.set(key.toString(), compareResult);
        }

        return result;
    }

    async compareByOfferPrice(offerPrice: OfferPrice, clientData: Map<string, string>): Promise<Map<string, boolean>> {
        const result: Map<string, boolean> = new Map();

        for (let rule of offerPrice.rules) {
            const clientValue: string | undefined = clientData.get(rule.rulesKey.toString());
            let compareResult: boolean = false;

            try {
                compareResult = clientValue != undefined && this.compareField(rule.rule, clientValue,  rule.value.toString());
            } catch (e) {
                console.log('compare error!', e);
            }

            result.set(rule.rulesKey.toString(), compareResult);
        }

        return result;
    }

    private compareField(compareAction: CompareAction, clientValue: string, offerCompareValue: string): boolean {
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
    private convertToCompareAction(value: string): CompareAction {
      switch (value) {
        case '0': return CompareAction.EQUALLY;
        case '1': return CompareAction.NOT_EQUAL;
        case '2': return CompareAction.LESS_OR_EQUAL;
        case '3': return CompareAction.MORE_OR_EQUAL;
        case '4': return CompareAction.MORE;
        case '5': return CompareAction.LESS;
        default: return CompareAction.EQUALLY;
      }
    }

}
