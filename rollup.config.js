import typescript from 'rollup-plugin-typescript';

const pkg = require('./package.json');

export default {
	input: 'src/index.ts',
	output: [
		{ file: pkg.main, format: 'cjs' },
		{ file: pkg.module, format: 'es' },
		{ file: 'dist/svelte-extras.umd.js', format: 'umd', name: 'svelte.extras' }
	],
	plugins: [typescript({ typescript: require('typescript') })]
};
