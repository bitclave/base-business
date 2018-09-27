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
                compareResult = clientValue != undefined && this.compareField(bitclave_base_1.CompareAction[value.toString()], clientValue, offer.compare.get(key));
            }
            catch (e) {
                console.log('compare error!', e);
            }
            result.set(key.toString(), compareResult);
        }
        return result;
    }
    async compareByOfferPrice(offerPrice, clientData) {
        const result = new Map();
        for (let rule of offerPrice.rules) {
            const clientValue = clientData.get(rule.rulesKey.toString());
            let compareResult = false;
            try {
                compareResult = clientValue != undefined && this.compareField(rule.rule, clientValue, rule.value.toString());
            }
            catch (e) {
                console.log('compare error!', e);
            }
            result.set(rule.rulesKey.toString(), compareResult);
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
}
exports.default = ComparatorImpl;
//# sourceMappingURL=ComparatorImpl.js.map