const assert = require('assert');
const setup = require('../setup.js');

module.exports = () => {
	describe('getDeep', () => {
		it('get a value from a keypath', () => {
			const foo = { bar: { nested: { value: 1 } } };
			const { component } = setup(`{{foo.bar.nested.value}}`, { foo });

			const value = component.getDeep( 'foo.bar.nested.value' );

			assert.equal( value, 1 );
		});

		it('get a value from an array keypath', () => {
			const foo = { bar: { nested: { array: [1] } } };
			const { component } = setup(`{{foo.bar.nested.array}}`, { foo });

			const value = component.getDeep( 'foo.bar.nested.array[0]' );

			assert.equal( value, 1 );
		});
	});
};