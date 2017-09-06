const assert = require('assert');
const setup = require('../setup.js');

module.exports = () => {
	describe('setDeep', () => {
		it('set a value with a keypath', () => {
			const foo = { bar: { nested: { value: 1 } } };
			const { component } = setup(`{{foo.bar.nested.value}}`, { foo });

			component.setDeep( 'foo.bar.nested.value', 2 )
			const value = component.get( 'foo' );

			assert.deepEqual( value, { bar: { nested: { value: 2 } } } );
		});

		it('set a value with an array keypath', () => {
			const foo = { bar: { nested: { array: [1] } } };
			const { component } = setup(`{{foo.bar.nested.array}}`, { foo });

			component.setDeep( 'foo.bar.nested.array[0]', 2 )
			const value = component.get( 'foo' );

			assert.deepEqual( value, { bar: { nested: { array: [2] } } } );
		});

		it('set a string value with a non-nested keypath', () => {
			const { component } = setup(`{{foo}}`, 'bar');

			component.setDeep( 'foo', 'baz' );
			const value = component.get( 'foo' );

			assert.equal( value, 'baz' );
		});

		it('set an array value with a non-nested keypath', () => {
			const { component } = setup(`{{foo}}`, [ 1, 2, 3 ]);

			component.setDeep( 'foo', [ 4, 5, 6 ] );
			const value = component.get( 'foo' );

			assert.deepEqual( value, [ 4, 5, 6 ] );
		});
	});
};