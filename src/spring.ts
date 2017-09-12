import { isDate } from './shared';
import { Component } from './interfaces';

const scheduler = {
	components: <Component[]>[],

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
		let hasComponents = false;

		let i = scheduler.components.length;
		while (i--) {
			const component = scheduler.components[i];
			const data: any = {};

			let hasSprings = false;

			for (const key in component._springs) {
				const spring = component._springs[key];

				if (spring.tick(data)) {
					hasSprings = true;
					hasComponents = true;
				} else {
					component._springCallbacks[key]();
					delete component._springs[key];
					delete component._springCallbacks[key];
				}
			}

			component._springing = true;
			component.set(data);
			component._springing = false;

			if (!hasSprings) scheduler.components.splice(i, 1);
		}

		if (hasComponents) {
			requestAnimationFrame(scheduler.next);
		} else {
			scheduler.running = false;
		}
	}
};

interface SpringOptions {
	stiffness: number;
	damping: number;
}

interface Spring {
	key: string | number;
	tick: (target: object) => void;
	update: (newValue: any, options: SpringOptions) => void;
}

function noop(){}

function snap(key: string | number, a: any, b: any, options: SpringOptions): Spring {
	return {
		key,
		tick: (object: any) => {
			object[key] = b;
			return false;
		},
		update: (object: any, options: SpringOptions) => {
			b = object;
		}
	};
}

function number(key: string | number, a: number, b: number, options: SpringOptions): Spring {
	let velocity = 0;
	let aborted = false;

	let { stiffness, damping } = options;

	const valueThreshold = Math.abs(b - a) * 0.001;
	const velocityThreshold = valueThreshold; // TODO is this right?

	return {
		key,
		tick: (object: any) => {
			const d = b - a;
			const spring = stiffness * d;
			const damper = damping * velocity;

			const acceleration = spring - damper;

			velocity += acceleration;
			a += velocity;

			object[key] = a;

			if (
				velocity < velocityThreshold &&
				Math.abs(b - a) < valueThreshold
			) {
				object[key] = b;
				return false;
			}

			object[key] = a;
			return true;
		},
		update: (object: any, options: SpringOptions) => {
			checkCompatibility(object, b);

			b = object;
			stiffness = options.stiffness;
			damping = options.damping;
		}
	};
}

function date(key: string | number, a: Date, b: Date, options: SpringOptions): Spring {
	const dummy = {};
	const subspring = number(key, a.getTime(), b.getTime(), options);

	return {
		key,
		tick: (object: any) => {
			if (!subspring.tick(dummy)) {
				object[key] = b;
				return false;
			}

			object[key] = new Date(dummy[key]);
			return true;
		},
		update: (object: any, options: SpringOptions) => {
			checkCompatibility(object, b);

			subspring.update(object.getTime(), options);
			b = object;
		}
	};
}

function array(key: string | number, a: any[], b: any[], options: SpringOptions): Spring {
	const value: any[] = [];
	const subsprings: Spring[] = [];

	for (let i = 0; i < a.length; i += 1) {
		subsprings.push(getSpring(i, a[i], b[i], options));
	}

	return {
		key,
		tick: (object: any) => {
			let active = false;

			for (let i = 0; i < subsprings.length; i += 1) {
				if (subsprings[i].tick(value)) active = true;
			}

			if (!active) {
				object[key] = b;
				return false;
			}

			object[key] = value;
			return true;
		},
		update: (object: any, options: SpringOptions) => {
			checkCompatibility(object, b);

			for (let i = 0; i < object.length; i += 1) {
				subsprings[i].update(object[i], options);
			}

			b = object;
		}
	};
}

function object(key: string | number, a: object, b: object, options: SpringOptions): Spring {
	const value = {};
	const subsprings: Spring[] = [];

	for (const k in a) {
		subsprings.push(getSpring(k, a[k], b[k], options));
	}

	return {
		key,
		tick: (object: any) => {
			let active = false;

			for (let i = 0; i < subsprings.length; i += 1) {
				if (subsprings[i].tick(value)) active = true;
			}

			if (!active) {
				object[key] = b;
				return false;
			}

			object[key] = value;
			return true;
		},
		update: (object: any, options: SpringOptions) => {
			checkCompatibility(object, b);

			for (let i = 0; i < subsprings.length; i += 1) {
				subsprings[i].update(object[subsprings[i].key], options);
			}

			b = object;
		}
	};
}

function checkCompatibility(a: any, b: any) {
	const type: string = typeof a;

	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b) || isDate(a) !== isDate(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (type === 'object') {
		if (!a || !b) throw new Error('Object cannot be null');

		if (Array.isArray(a)) {
			if (a.length !== b.length) {
				throw new Error('Cannot interpolate arrays of different length');
			}
		}

		else {
			const aKeys = Object.keys(a);
			const bKeys = Object.keys(b);

			if (!keysMatch(a, b)) throw new Error('Cannot interpolate differently-shaped objects');
		}
	}

	else if (type !== 'number') {
		throw new Error(`Cannot interpolate ${type} values`);
	}
}

function getSpring(key: string | number, a: any, b: any, options: SpringOptions): Spring {
	if (a === b || a !== a) return snap(key, a, b, options);

	checkCompatibility(a, b);

	if (typeof a === 'object') {
		if (Array.isArray(a)) {
			return array(key, a, b, options);
		}

		if (isDate(a)) {
			return date(key, a, b, options);
		}

		return object(key, a, b, options);
	}

	return number(key, a, b, options);
}

export function spring(this: Component, key: string, to: any, options: SpringOptions) {
	if (!this._springs) {
		this._springs = Object.create(null);
		this._springCallbacks = Object.create(null);
		this._springing = false;

		const set = this.set;
		this.set = (data: {}) => {
			if (!this._springing) {
				for (const key in data) {
					delete this._springs[key];
				}
			}
			set.call(this, data);
		};
	}

	if (this._springs[key]) {
		this._springs[key].update(to, options);
	} else {
		const spring = getSpring(key, this.get(key), to, options);
		this._springs[key] = spring;
	}

	const promise = new Promise((fulfil) => {
		this._springCallbacks[key] = fulfil;
	});

	scheduler.add(this);

	return promise;
}

function keysMatch(a: object, b: object) {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) return false;

	for (let i = 0; i < aKeys.length; i += 1) {
		if (!(aKeys[i] in b)) return false;
	}

	return true;
}