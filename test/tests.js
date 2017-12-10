const { rollup } = require('rollup');
const virtual = require('rollup-plugin-virtual');
const assert = require('assert');

require('console-group').install();
require('./htmlEqual.js');

describe('svelte-extras', () => {
	require('./array-methods/index.js')();
	require('./tween/index.js')();
	require('./observeDeep/index.js')();
	require('./observeMany/index.js')();
	require('./getDeep/index.js')();
	require('./setDeep/index.js')();
	require('./spring/index.js')();

	describe('tree-shaking', () => {
		it('does not include any unwanted code', async () => {
			const warnings = [];
			const bundle = await rollup({
				input: 'entry',
				plugins: [
					virtual({
						entry: `import './dist/svelte-extras.es.js';`
					})
				],
				onwarn: warning => {
					warnings.push(warning);
				}
			});

			await bundle.generate({ format: 'es' });

			assert.equal(warnings.length, 1);
			assert.equal(warnings[0].code, 'EMPTY_BUNDLE');
		});
	});
});
