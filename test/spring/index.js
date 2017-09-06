const assert = require('assert');
const setup = require('../setup.js');

module.exports = () => {
	describe.only('spring', () => {
		it('springs a number', () => {
			const { component, target, raf } = setup(`{{x}}`, {
				x: 20
			});

			const spring = component.spring('x', 40, {
				stiffness: 0.1,
				damping: 0.01
			});

			raf.tick(null);
			assert(component.get('x'), 22);
			raf.tick(null);
			assert(component.get('x'), 25.78);

			// this isn't great — it could be exactly 40 while
			// the spring is still active. not sure how best to test
			while (component.get('x') !== 40) {
				raf.tick(null);
			}

			return spring.then(() => {
				assert.equal(component.get('x'), 40);
				assert.htmlEqual(target.innerHTML, '40');
			});
		});

		it('springs a date', () => {
			const a = 1496986887000;
			const c = 1496986889000;

			const { component, target, raf } = setup(`{{x.getTime()}}`, {
				x: new Date(a)
			});

			const spring = component.spring('x', new Date(c), {
				stiffness: 0.1,
				damping: 0.01
			});

			raf.tick(null);
			assert(component.get('x'), 22);
			raf.tick(null);
			assert(component.get('x'), 25.78);

			while (component.get('x').getTime() !== c) {
				raf.tick(null);
			}

			return spring.then(() => {
				assert.equal(component.get('x').getTime(), c);
				assert.htmlEqual(target.innerHTML, String(c));
			});
		});

		it('springs an array', () => {
			const { component, target, raf } = setup(`{{x[0]}}`, {
				x: [20]
			});

			const spring = component.spring('x', [40], {
				stiffness: 0.1,
				damping: 0.01
			});

			raf.tick(null);
			assert(component.get('x')[0], 22);
			raf.tick(null);
			assert(component.get('x')[0], 25.78);

			// this isn't great — it could be exactly 40 while
			// the spring is still active. not sure how best to test
			while (component.get('x')[0] !== 40) {
				raf.tick(null);
			}

			return spring.then(() => {
				assert.equal(component.get('x')[0], 40);
				assert.htmlEqual(target.innerHTML, '40');
			});
		});

		it('springs an object', () => {
			const { component, target, raf } = setup(`{{x.y}}`, {
				x: { y: 20 }
			});

			const spring = component.spring('x', { y: 40 }, {
				stiffness: 0.1,
				damping: 0.01
			});

			raf.tick(null);
			assert(component.get('x').y, 22);
			raf.tick(null);
			assert(component.get('x').y, 25.78);

			// this isn't great — it could be exactly 40 while
			// the spring is still active. not sure how best to test
			while (component.get('x').y !== 40) {
				raf.tick(null);
			}

			return spring.then(() => {
				assert.equal(component.get('x').y, 40);
				assert.htmlEqual(target.innerHTML, '40');
			});
		});

		// it('aborts a tween if data is set', () => {
		// 	const { component, target, raf } = setup(`{{x}}`, {
		// 		x: 20
		// 	});

		// 	const tween = component.tween('x', 40, {
		// 		duration: 100
		// 	});

		// 	assert.equal(component.get('x'), 20);
		// 	assert.htmlEqual(target.innerHTML, '20');

		// 	raf.tick(50);
		// 	assert.equal(component.get('x'), 30);
		// 	assert.htmlEqual(target.innerHTML, '30');

		// 	component.set({ x: -99 });

		// 	raf.tick(75);
		// 	assert.equal(component.get('x'), -99);
		// 	assert.htmlEqual(target.innerHTML, '-99');

		// 	tween.then(() => {
		// 		throw new Error('Promise should not be fulfilled');
		// 	});
		// });

		// it('allows custom interpolators', () => {
		// 	const { component, target, raf } = setup(`{{x}}`, {
		// 		x: 'a'
		// 	});

		// 	const tween = component.tween('x', 'z', {
		// 		duration: 100,
		// 		interpolate: (a, b) => {
		// 			const start = a.charCodeAt(0);
		// 			const delta = b.charCodeAt(0) - start;
		// 			return t => String.fromCharCode(~~(start + t * delta));
		// 		}
		// 	});

		// 	raf.tick(50);
		// 	assert.equal(component.get('x'), 'm');
		// 	assert.htmlEqual(target.innerHTML, 'm');

		// 	raf.tick(100);

		// 	return tween.then(() => {
		// 		assert.equal(component.get('x'), 'z');
		// 		assert.htmlEqual(target.innerHTML, 'z');
		// 	});
		// });
	});
};