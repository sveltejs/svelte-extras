const assert = require('assert');
const setup = require('../setup.js');

module.exports = function () {
	describe('array methods', () => {
		it('pushes to an array', () => {
			const { component, target } = setup();
			const len = component.push('array', 'bop');

			assert.equal(len, 4);
			assert.deepEqual(component.get('array'), ['foo', 'bar', 'baz', 'bop']);
			assert.htmlEqual(target.innerHTML, `(foo)(bar)(baz)(bop)`);
		});

		it('pops from an array', () => {
			const { component, target } = setup();
			const last = component.pop('array');

			assert.equal(last, 'baz');
			assert.deepEqual(component.get('array'), ['foo', 'bar']);
			assert.htmlEqual(target.innerHTML, `(foo)(bar)`);
		});

		it('shifts from an array', () => {
			const { component, target } = setup();
			const first = component.shift('array');

			assert.equal(first, 'foo');
			assert.deepEqual(component.get('array'), ['bar', 'baz']);
			assert.htmlEqual(target.innerHTML, `(bar)(baz)`);
		});

		it('unshifts to an array', () => {
			const { component, target } = setup();
			const len = component.unshift('array', 'bop');

			assert.equal(len, 4);
			assert.deepEqual(component.get('array'), ['bop', 'foo', 'bar', 'baz']);
			assert.htmlEqual(target.innerHTML, `(bop)(foo)(bar)(baz)`);
		});

		it('splices from an array', () => {
			const { component, target } = setup();
			const spliced = component.splice('array', 1, 1);

			assert.deepEqual(spliced, ['bar']);
			assert.deepEqual(component.get('array'), ['foo', 'baz']);
			assert.htmlEqual(target.innerHTML, `(foo)(baz)`);
		});

		it('sorts an array', () => {
			const { component, target } = setup();
			const sorted = component.sort('array');

			assert.deepEqual(sorted, ['bar', 'baz', 'foo']);
			assert.deepEqual(component.get('array'), ['bar', 'baz', 'foo']);
			assert.htmlEqual(target.innerHTML, `(bar)(baz)(foo)`);
		});

		it('reverses an array', () => {
			const { component, target } = setup();
			const reversed = component.reverse('array');

			assert.deepEqual(reversed, ['baz', 'bar', 'foo']);
			assert.deepEqual(component.get('array'), ['baz', 'bar', 'foo']);
			assert.htmlEqual(target.innerHTML, `(baz)(bar)(foo)`);
		});

		it('supports dot notation', () => {
			const { component, target } = setup(
				`
				{{#each x.y.z as item}}
					({{item}})
				{{/each}}`,
				{
					x: {
						y: {
							z: ['foo', 'bar', 'baz']
						}
					}
				}
			);

			component.push('x.y.z', 'bop');

			assert.deepEqual(component.get(), {
				x: {
					y: {
						z: ['foo', 'bar', 'baz', 'bop']
					}
				}
			});

			assert.htmlEqual(target.innerHTML, `(foo)(bar)(baz)(bop)`);
		});

		it('supports array notation', () => {
			const { component, target } = setup(
				`
				{{#each rows as row}}
					{{#each row as cell}}
						({{cell}})
					{{/each}}
				{{/each}}`,
				{
					rows: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']]
				}
			);

			component.shift('rows[1]');
			component.push('rows[1]', 'x');

			assert.deepEqual(component.get(), {
				rows: [['a', 'b', 'c'], ['e', 'f', 'x'], ['g', 'h', 'i']]
			});

			assert.htmlEqual(target.innerHTML, `(a)(b)(c)(e)(f)(x)(g)(h)(i)`);
		});
	});
};