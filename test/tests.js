const assert = require('assert');
const setup = require('./setup.js');

require('console-group').install();
require('./htmlEqual.js');

describe('svelte-extras', () => {
	describe('array methods', () => {
		it('pushes to an array', () => {
			const { component, target } = setup();
			const len = component.push('array', 'bop');

			assert.equal(len, 4);
			assert.deepEqual(component.get('array'), ['foo', 'bar', 'baz', 'bop']);
			assert.htmlEqual(target.innerHTML, `(foo)(bar)(baz)(bop)`);
		});

		it('pops from an array', () => {
			const { component, target } = setup();
			const last = component.pop('array');

			assert.equal(last, 'baz');
			assert.deepEqual(component.get('array'), ['foo', 'bar']);
			assert.htmlEqual(target.innerHTML, `(foo)(bar)`);
		});

		it('shifts from an array', () => {
			const { component, target } = setup();
			const first = component.shift('array');

			assert.equal(first, 'foo');
			assert.deepEqual(component.get('array'), ['bar', 'baz']);
			assert.htmlEqual(target.innerHTML, `(bar)(baz)`);
		});

		it('unshifts to an array', () => {
			const { component, target } = setup();
			const len = component.unshift('array', 'bop');

			assert.equal(len, 4);
			assert.deepEqual(component.get('array'), ['bop', 'foo', 'bar', 'baz']);
			assert.htmlEqual(target.innerHTML, `(bop)(foo)(bar)(baz)`);
		});

		it('splices from an array', () => {
			const { component, target } = setup();
			const spliced = component.splice('array', 1, 1);

			assert.deepEqual(spliced, ['bar']);
			assert.deepEqual(component.get('array'), ['foo', 'baz']);
			assert.htmlEqual(target.innerHTML, `(foo)(baz)`);
		});

		it('sorts an array', () => {
			const { component, target } = setup();
			const sorted = component.sort('array');

			assert.deepEqual(sorted, ['bar', 'baz', 'foo']);
			assert.deepEqual(component.get('array'), ['bar', 'baz', 'foo']);
			assert.htmlEqual(target.innerHTML, `(bar)(baz)(foo)`);
		});

		it('reverses an array', () => {
			const { component, target } = setup();
			const reversed = component.reverse('array');

			assert.deepEqual(reversed, ['baz', 'bar', 'foo']);
			assert.deepEqual(component.get('array'), ['baz', 'bar', 'foo']);
			assert.htmlEqual(target.innerHTML, `(baz)(bar)(foo)`);
		});

		it('supports dot notation', () => {
			const { component, target } = setup(
				`
				{{#each x.y.z as item}}
					({{item}})
				{{/each}}`,
				{
					x: {
						y: {
							z: ['foo', 'bar', 'baz']
						}
					}
				}
			);

			component.push('x.y.z', 'bop');

			assert.deepEqual(component.get(), {
				x: {
					y: {
						z: ['foo', 'bar', 'baz', 'bop']
					}
				}
			});

			assert.htmlEqual(target.innerHTML, `(foo)(bar)(baz)(bop)`);
		});

		it('supports array notation', () => {
			const { component, target } = setup(
				`
				{{#each rows as row}}
					{{#each row as cell}}
						({{cell}})
					{{/each}}
				{{/each}}`,
				{
					rows: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']]
				}
			);

			component.shift('rows[1]');
			component.push('rows[1]', 'x');

			assert.deepEqual(component.get(), {
				rows: [['a', 'b', 'c'], ['e', 'f', 'x'], ['g', 'h', 'i']]
			});

			assert.htmlEqual(target.innerHTML, `(a)(b)(c)(e)(f)(x)(g)(h)(i)`);
		});
	});

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

		it('adjusts the duration of a tween that replaced a tween in progress if { adjustDuration: true }', () => {
			const { component, target, raf } = setup(`{{x}}`, {
				x: 20
			});

			let tween = component.tween('x', 40, {
				duration: 100
			});

			assert.equal(component.get('x'), 20);
			assert.htmlEqual(target.innerHTML, '20');

			// 40% through tween
			raf.tick(40);
			assert.equal(component.get('x'), 28);
			assert.htmlEqual(target.innerHTML, '28');

			// new tween will only use 40% of its duration, 40ms
			tween = component.tween('x', 130, {
				duration: 100,
				adjustDuration: true
			});


			// 20ms later, but 50% done of 100ms
			raf.tick(60);
			assert.equal(component.get('x'), 79);
			assert.htmlEqual(target.innerHTML, '79');

			// 40 so far, yet 100% done
			raf.tick(80);

			return tween.then(() => {
				assert.equal(component.get('x'), 130);
				assert.htmlEqual(target.innerHTML, '130');
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

	describe('observeDeep', () => {
		it('observes a property of an object', () => {
			const foo = { bar: 1 };
			const { component } = setup(`{{foo.bar}}`, { foo });

			const observed = [];

			component.observeDeep('foo.bar', (n, o) => {
				observed.push([o, n]);
			});

			foo.bar = 2;
			component.set({ foo });

			component.set({ foo: { bar: 3 } });

			assert.deepEqual(observed, [
				[undefined, 1],
				[1, 2],
				[2, 3]
			]);
		});

		it('respects `init: false`', () => {
			const foo = { bar: 1 };
			const { component } = setup(`{{foo.bar}}`, { foo });

			const observed = [];

			component.observeDeep('foo.bar', (n, o) => {
				observed.push([o, n]);
			}, { init: false });

			foo.bar = 2;
			component.set({ foo });

			component.set({ foo: { bar: 3 } });

			assert.deepEqual(observed, [
				[1, 2],
				[2, 3]
			]);
		});

		it('ignores nested values that are unchanged', () => {
			const foo = { bar: 1 };
			const { component } = setup(`{{foo.bar}}`, { foo });

			const observed = [];

			component.observeDeep('foo.bar', (n, o) => {
				observed.push([o, n]);
			});

			foo.bar = 1;
			component.set({ foo });

			component.set({ foo: { bar: 1 } });

			assert.deepEqual(observed, [
				[undefined, 1]
			]);
		});

		it('observes a property of an array', () => {
			const foo = [1];
			const { component } = setup(`{{foo[0]}}`, { foo });

			const observed = [];

			component.observeDeep('foo[0]', (n, o) => {
				observed.push([o, n]);
			});

			foo[0] = 2;
			component.set({ foo });

			component.set({ foo: [3] });

			assert.deepEqual(observed, [
				[undefined, 1],
				[1, 2],
				[2, 3]
			]);
		});
	});
	
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
});
