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

		it('aborts a tween if data is set', () => {
			const { component, raf } = setup(`{{x}}`, {
				x: 20
			});

			component.spring('x', 40, {
				stiffness: 0.1,
				damping: 0.01
			});

			raf.tick(null);
			assert(component.get('x'), 22);
			raf.tick(null);
			assert(component.get('x'), 25.78);

			component.set({ x: 30 });
			raf.tick(null);
			assert(component.get('x'), 30);
			raf.tick(null);
			assert(component.get('x'), 30);
		});
	});
};