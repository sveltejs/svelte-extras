const assert = require('assert');
const setup = require('../setup.js');

module.exports = () => {
	describe('observeDeep', () => {
		it('observes a property of an object', () => {
			const foo = { bar: 1 };
			const { component } = setup(`{foo.bar}`, { foo });

			const observed = [];

			component.observeDeep('foo.bar', (n, o) => {
				observed.push([o, n]);
			});

			foo.bar = 2;
			component.set({ foo });

			component.set({ foo: { bar: 3 } });

			assert.deepEqual(observed, [
				[undefined, 1],
				[1, 2],
				[2, 3]
			]);
		});

		it('respects `init: false`', () => {
			const foo = { bar: 1 };
			const { component } = setup(`{foo.bar}`, { foo });

			const observed = [];

			component.observeDeep('foo.bar', (n, o) => {
				observed.push([o, n]);
			}, { init: false });

			foo.bar = 2;
			component.set({ foo });

			component.set({ foo: { bar: 3 } });

			assert.deepEqual(observed, [
				[1, 2],
				[2, 3]
			]);
		});

		it('ignores nested values that are unchanged', () => {
			const foo = { bar: 1 };
			const { component } = setup(`{foo.bar}`, { foo });

			const observed = [];

			component.observeDeep('foo.bar', (n, o) => {
				observed.push([o, n]);
			});

			foo.bar = 1;
			component.set({ foo });

			component.set({ foo: { bar: 1 } });

			assert.deepEqual(observed, [
				[undefined, 1]
			]);
		});

		it('observes a property of an array', () => {
			const foo = [1];
			const { component } = setup(`{foo[0]}`, { foo });

			const observed = [];

			component.observeDeep('foo[0]', (n, o) => {
				observed.push([o, n]);
			});

			foo[0] = 2;
			component.set({ foo });

			component.set({ foo: [3] });

			assert.deepEqual(observed, [
				[undefined, 1],
				[1, 2],
				[2, 3]
			]);
		});
	});
};