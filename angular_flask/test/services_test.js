'use strict';

describe('dataGenerator service', function () {

    beforeEach(module('app'));

    it('randomRange should return a random number between two specified as params', inject(function (dataGenerator) {

        expect(dataGenerator.randomRange(18, 100)).not.toBeNaN();

        for (var i = 0; i < 200; i++) {
            expect(dataGenerator.randomRange(18, 100)).toBeLessThan(101);
            expect(dataGenerator.randomRange(18, 100)).toBeGreaterThan(17);
        }

    }));

});