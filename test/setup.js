const { JSDOM } = require('jsdom');

const svelte = require('svelte');
const extras = require('../dist/svelte-extras.cjs.js');

module.exports = function setup(
	template = `
		{{#each array as item}}
			({{item}})
		{{/each}}
	`,
	data = { array: ['foo', 'bar', 'baz'] }
) {
	const { window } = new JSDOM('<main></main>');
	global.document = window.document;
	const target = window.document.querySelector('main');

	// set of hacks to support tween tests
	const raf = {
		time: 0,
		callback: null,
		tick: now => {
			raf.time = now;
			if ( raf.callback ) raf.callback();
		}
	};
	if (!window.performance) window.performance = {};
	window.performance.now = () => raf.time;
	global.requestAnimationFrame = cb => {
		let called = false;
		raf.callback = () => {
			if ( !called ) {
				called = true;
				cb();
			}
		};
	};

	global.window = window;

	Object.assign(global, extras);

	const Component = svelte.create(`
		${template}

		<script>
			export default {
				methods: {
					push,
					pop,
					shift,
					unshift,
					splice,
					sort,
					reverse,
					tween,
					observe,
					observeDeep,
					observeMany,
					getDeep,
					setDeep,
					spring
				}
			}
		</script>
	`);
	const component = new Component({
		target,
		data
	});

	return { component, target, raf };
};
