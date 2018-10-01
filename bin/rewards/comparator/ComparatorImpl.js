"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitclave_base_1 = require("bitclave-base");
class ComparatorImpl {
    async compare(offer, clientData) {
        const result = new Map();
        for (let [key, value] of offer.rules.entries()) {
            const clientValue = clientData.get(key.toString());
            let compareResult = false;
            try {
                const compareAction = this.convertToCompareAction(value.toString());
                compareResult = clientValue != undefined && this.compareField(compareAction, clientValue, offer.compare.get(key));
            }
            catch (e) {
                console.log('compare error!', e);
            }
            result.set(key.toString(), compareResult);
        }
        return result;
    }
    compareField(compareAction, clientValue, offerCompareValue) {
        switch (compareAction) {
            case bitclave_base_1.CompareAction.EQUALLY:
                return clientValue == offerCompareValue;
            case bitclave_base_1.CompareAction.NOT_EQUAL:
                return clientValue != offerCompareValue;
            case bitclave_base_1.CompareAction.MORE:
                return parseFloat(clientValue) > parseFloat(offerCompareValue);
            case bitclave_base_1.CompareAction.MORE_OR_EQUAL:
                return parseFloat(clientValue) >= parseFloat(offerCompareValue);
            case bitclave_base_1.CompareAction.LESS:
                return parseFloat(clientValue) < parseFloat(offerCompareValue);
            case bitclave_base_1.CompareAction.LESS_OR_EQUAL:
                return parseFloat(clientValue) <= parseFloat(offerCompareValue);
            default:
                return false;
        }
    }
    convertToCompareAction(value) {
        switch (value) {
            case '0': return bitclave_base_1.CompareAction.EQUALLY;
            case '1': return bitclave_base_1.CompareAction.NOT_EQUAL;
            case '2': return bitclave_base_1.CompareAction.LESS_OR_EQUAL;
            case '3': return bitclave_base_1.CompareAction.MORE_OR_EQUAL;
            case '4': return bitclave_base_1.CompareAction.MORE;
            case '5': return bitclave_base_1.CompareAction.LESS;
            default: return bitclave_base_1.CompareAction.EQUALLY;
        }
    }
}
exports.default = ComparatorImpl;
//# sourceMappingURL=ComparatorImpl.js.map