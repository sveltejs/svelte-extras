const assert = require('assert');
const setup = require('./setup.js');

require('console-group').install();
require('./htmlEqual.js');

describe('svelte-extras', () => {
	require('./array-methods/index.js')();
	require('./tween/index.js')();
	require('./observeDeep/index.js')();
	require('./getDeep/index.js')();
	require('./setDeep/index.js')();
});
