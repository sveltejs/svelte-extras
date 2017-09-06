const assert = require('assert');
const setup = require('../setup.js');

module.exports = () => {
	describe('tween', () => {
		it('tweens a number', () => {
			const { component, target, raf } = setup(`{{x}}`, {
				x: 20
			});

			const tween = component.tween('x', 40, {
				duration: 100
			});

			assert.equal(component.get('x'), 20);
			assert.htmlEqual(target.innerHTML, '20');

			raf.tick(50);
			assert.equal(component.get('x'), 30);
			assert.htmlEqual(target.innerHTML, '30');

			raf.tick(100);

			return tween.then(() => {
				assert.equal(component.get('x'), 40);
				assert.htmlEqual(target.innerHTML, '40');
			});
		});

		it('tweens a date', () => {
			const a = 1496986887000;
			const b = 1496986888000;
			const c = 1496986889000;

			const { component, target, raf } = setup(`{{x.getTime()}}`, {
				x: new Date(a)
			});

			const tween = component.tween('x', new Date(c), {
				duration: 100
			});

			assert.equal(component.get('x').getTime(), a);
			assert.htmlEqual(target.innerHTML, String(a));

			raf.tick(50);
			assert.equal(component.get('x').getTime(), b);
			assert.htmlEqual(target.innerHTML, String(b));

			raf.tick(100);

			return tween.then(() => {
				assert.equal(component.get('x').getTime(), c);
				assert.htmlEqual(target.innerHTML, String(c));
			});
		});

		it('tweens an array', () => {
			const { component, target, raf } = setup(`{{x[0]}}`, {
				x: [20]
			});

			const tween = component.tween('x', [40], {
				duration: 100
			});

			assert.deepEqual(component.get('x'), [20]);
			assert.htmlEqual(target.innerHTML, '20');

			raf.tick(50);
			assert.deepEqual(component.get('x'), [30]);
			assert.htmlEqual(target.innerHTML, '30');

			raf.tick(100);

			return tween.then(() => {
				assert.deepEqual(component.get('x'), [40]);
				assert.htmlEqual(target.innerHTML, '40');
			});
		});

		it('tweens an object', () => {
			const { component, target, raf } = setup(`{{x.y}}`, {
				x: { y: 20 }
			});

			const tween = component.tween(
				'x',
				{ y: 40 },
				{
					duration: 100
				}
			);

			assert.deepEqual(component.get('x'), { y: 20 });
			assert.htmlEqual(target.innerHTML, '20');

			raf.tick(50);
			assert.deepEqual(component.get('x'), { y: 30 });
			assert.htmlEqual(target.innerHTML, '30');

			raf.tick(100);

			return tween.then(() => {
				assert.deepEqual(component.get('x'), { y: 40 });
				assert.htmlEqual(target.innerHTML, '40');
			});
		});

		it('allows tweens to be aborted programmatically', () => {
			const { component, target, raf } = setup(`{{x}}`, {
				x: 20
			});

			const tween = component.tween('x', 40, {
				duration: 100
			});

			assert.equal(component.get('x'), 20);
			assert.htmlEqual(target.innerHTML, '20');

			tween.abort();

			raf.tick(50);
			assert.equal(component.get('x'), 20);
			assert.htmlEqual(target.innerHTML, '20');

			tween.then(() => {
				throw new Error('Promise should not be fulfilled');
			});
		});

		it('aborts a tween if a new tween takes its place', () => {
			const { component, target, raf } = setup(`{{x}}`, {
				x: 20
			});

			let tween = component.tween('x', 40, {
				duration: 100
			});

			assert.equal(component.get('x'), 20);
			assert.htmlEqual(target.innerHTML, '20');

			raf.tick(50);
			assert.equal(component.get('x'), 30);
			assert.htmlEqual(target.innerHTML, '30');

			tween = component.tween('x', 130, {
				duration: 100
			});

			raf.tick(75);
			assert.equal(component.get('x'), 55);
			assert.htmlEqual(target.innerHTML, '55');

			raf.tick(150);

			return tween.then(() => {
				assert.equal(component.get('x'), 130);
				assert.htmlEqual(target.innerHTML, '130');
			});
		});

		it('aborts a tween if data is set', () => {
			const { component, target, raf } = setup(`{{x}}`, {
				x: 20
			});

			const tween = component.tween('x', 40, {
				duration: 100
			});

			assert.equal(component.get('x'), 20);
			assert.htmlEqual(target.innerHTML, '20');

			raf.tick(50);
			assert.equal(component.get('x'), 30);
			assert.htmlEqual(target.innerHTML, '30');

			component.set({ x: -99 });

			raf.tick(75);
			assert.equal(component.get('x'), -99);
			assert.htmlEqual(target.innerHTML, '-99');

			tween.then(() => {
				throw new Error('Promise should not be fulfilled');
			});
		});

		it('allows custom interpolators', () => {
			const { component, target, raf } = setup(`{{x}}`, {
				x: 'a'
			});

			const tween = component.tween('x', 'z', {
				duration: 100,
				interpolate: (a, b) => {
					const start = a.charCodeAt(0);
					const delta = b.charCodeAt(0) - start;
					return t => String.fromCharCode(~~(start + t * delta));
				}
			});

			raf.tick(50);
			assert.equal(component.get('x'), 'm');
			assert.htmlEqual(target.innerHTML, 'm');

			raf.tick(100);

			return tween.then(() => {
				assert.equal(component.get('x'), 'z');
				assert.htmlEqual(target.innerHTML, 'z');
			});
		});
	});
};