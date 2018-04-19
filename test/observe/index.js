const assert = require('assert');
const setup = require('../setup.js');

module.exports = () => {
	describe('observe', () => {
		it('observes a property', () => {
			const { component, target } = setup(`{foo}`, { foo: 1 });

			const observed = [];

			component.observe(['foo'], (n, o) => {
				observed.push([o, n, target.innerHTML]);
			});

			component.set({ foo: 2 });
			component.set({ foo: 3 });
			component.set({ bar: 4 });

			assert.deepEqual(observed, [
				[undefined, 1, '1'],
				[1, 2, '1'],
				[2, 3, '2']
			]);
		});

		it('respects init: false', () => {
			const { component, target } = setup(`{foo}`, { foo: 1 });

			const observed = [];

			component.observe(['foo'], (n, o) => {
				observed.push([o, n, target.innerHTML]);
			}, { init: false });

			component.set({ foo: 2 });
			component.set({ foo: 3 });
			component.set({ bar: 4 });

			assert.deepEqual(observed, [
				[1, 2, '1'],
				[2, 3, '2']
			]);
		});

		it('respects defer: true', () => {
			const { component, target } = setup(`{foo}`, { foo: 1 });

			const observed = [];

			component.observe(['foo'], (n, o) => {
				observed.push([o, n, target.innerHTML]);
			}, { defer: true });

			component.set({ foo: 2 });
			component.set({ foo: 3 });
			component.set({ bar: 4 });

			assert.deepEqual(observed, [
				[undefined, 1, '1'],
				[1, 2, '2'],
				[2, 3, '3']
			]);
		});
	});
};