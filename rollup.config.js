import typescript from 'rollup-plugin-typescript';

const pkg = require('./package.json');

export default {
	entry: 'src/index.ts',
	moduleName: 'svelte.extras',
	plugins: [typescript({ typescript: require('typescript') })],
	targets: [
		{ dest: pkg.main, format: 'cjs' },
		{ dest: pkg.module, format: 'es' },
		{ dest: 'dist/svelte-extras.umd.js', format: 'umd' }
	]
};
