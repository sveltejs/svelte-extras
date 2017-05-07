import Component from './interfaces.ts';

const scheduler = {
	components: [],

	running: false,

	add: (component: Component) => {
		if (~scheduler.components.indexOf(component)) return;
		scheduler.components.push(component);

		if (!scheduler.running) {
			scheduler.running = true;
			requestAnimationFrame(scheduler.next);
		}
	},

	next: () => {
		const now = window.performance.now();
		let hasComponents = false;

		let i = scheduler.components.length;
		while (i--) {
			const component = scheduler.components[i];
			const data: any = {};

			let hasTweens = false;

			for (const key in component._currentTweens) {
				const t = component._currentTweens[key];
				if (now >= t.end) {
					data[key] = t.to;
					delete component._currentTweens[key];
					t.fulfil();
				} else {
					hasTweens = true;
					hasComponents = true;
					if (now >= t.start) {
						const p = (now - t.start) / t.duration;
						data[key] = t.value(t.ease(p));
					}
				}
			}

			component._tweening = true;
			component.set(data);
			component._tweening = false;

			if (!hasTweens) scheduler.components.splice(i, 1);
		}

		if (hasComponents) {
			requestAnimationFrame(scheduler.next);
		} else {
			scheduler.running = false;
		}
	}
};

function snap ( to: any ) {
	return () => to;
}

function interpolate (a: any, b: any) {
	if (a === b || a !== a) return snap(a);

	const type: string = typeof a;

	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (Array.isArray(a)) {
		const arr = b.map((bi :any, i :number) => {
			return interpolate(a[i], bi);
		});

		return (t: number) => {
			return arr.map((fn) => fn(t));
		}
	}

	if (type === 'object') {
		if (!a || !b) throw new Error('Object cannot be null');

		const keys = Object.keys(b);
		const interpolators: any = {};
		const result: any = {};

		keys.forEach(key => {
			interpolators[key] = interpolate(a[key], b[key]);
		});

		return (t: number) => {
			keys.forEach(key => {
				result[key] = interpolators[key](t);
			});
			return result;
		};
	}

	if (type === 'number') {
		const delta = b - a;
		return (t: number) => {
			return a + t * delta;
		};
	}

	throw new Error(`Cannot interpolate ${type} values`);
}

interface Options {
	delay?: number
	duration?: number
	easing?(t: number): number
}

function linear (x: number) {
	return x;
}

export function tween(this: Component, key: string, to: any, options: Options = {}) {
	if (!this._currentTweens) {
		this._currentTweens = Object.create(null);
		this._tweening = false;

		const set = this.set;
		this.set = (data: {}) => {
			if (!this._tweening) {
				for (const key in data) {
					if (this._currentTweens[key]) this._currentTweens[key].abort();
				}
			}
			set.call(this, data);
		};
	}

	if (this._currentTweens[key]) this._currentTweens[key].abort();

	const start = window.performance.now() + ( options.delay || 0 );
	const duration = options.duration || 400;
	const end = start + duration;

	const t = {
		key,
		value: interpolate(this.get(key), to),
		to,
		start,
		end,
		duration,
		ease: options.easing || linear,
		running: true,
		abort: () => {
			t.running = false;
			delete this._currentTweens[key];
		}
	};

	this._currentTweens[key] = t;
	scheduler.add(this);

	let running;

	const promise = new Promise(fulfil => {
		t.fulfil = fulfil;
	});

	promise.abort = t.abort;

	return promise;
}