const assert = require('assert');
const setup = require('../setup.js');

module.exports = () => {
	describe('observeMany', () => {
		it('fires once per set, however many properties change', () => {
			const { component, target } = setup(`{{foo}} {{bar}}`, { foo: 1, bar: 2 });

			const observed = [];

			component.observeMany(['foo', 'bar'], (n, o) => {
				observed.push([o, n, target.innerHTML]);
			});

			component.set({ foo: 3, bar: 4 });
			component.set({ foo: 5 });
			component.set({ bar: 6 });

			assert.deepEqual(observed, [
				[[undefined, undefined], [1, 2], '1 2'],
				[[1, 2], [3, 4], '1 2'],
				[[3, 4], [5, 4], '3 4'],
				[[5, 4], [5, 6], '5 4']
			]);
		});

		it('respects init: false', () => {
			const { component, target } = setup(`{{foo}} {{bar}}`, { foo: 1, bar: 2 });

			const observed = [];

			component.observeMany(['foo', 'bar'], (n, o) => {
				observed.push([o, n, target.innerHTML]);
			}, {
				init: false
			});

			component.set({ foo: 3, bar: 4 });

			assert.deepEqual(observed, [
				[[1, 2], [3, 4], '1 2']
			]);
		});

		it('respects defer: true', () => {
			const { component, target } = setup(`{{foo}} {{bar}}`, { foo: 1, bar: 2 });

			const observed = [];

			component.observeMany(['foo', 'bar'], (n, o) => {
				observed.push([o, n, target.innerHTML]);
			}, {
				defer: true
			});

			component.set({ foo: 3, bar: 4 });

			assert.deepEqual(observed, [
				[[undefined, undefined], [1, 2], '1 2'],
				[[1, 2], [3, 4], '3 4']
			]);
		});
	});
};