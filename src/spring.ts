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

				if (spring(data)) {
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

function noop(){}

function snap(key: string | number, a: any, b: any, options: SpringOptions) {
	return (object: any) => {
		object[key] = b;
		return false;
	};
}

function number(key: string | number, a: number, b: number, options: SpringOptions) {
	let velocity = 0;
	let aborted = false;

	const { stiffness, damping } = options;

	const valueThreshold = Math.abs(b - a) * 0.01;
	const velocityThreshold = valueThreshold; // TODO is this right?

	return (object: any) => {
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
	};
}

function date(key: string | number, a: Date, b: Date, options: SpringOptions) {
	const dummy = {};
	const subspring = number(key, a.getTime(), b.getTime(), options);

	return (object: any) => {
		if (!subspring(dummy)) {
			object[key] = b;
			return false;
		}

		object[key] = new Date(dummy[key]);
		return true;
	};
}

function array(key: string | number, a: any[], b: any[], options: SpringOptions) {
	const value = [];
	const subsprings = [];

	for (let i = 0; i < a.length; i += 1) {
		subsprings.push(getSpring(i, a[i], b[i], options));
	}

	return (object: any) => {
		let active = false;

		for (let i = 0; i < subsprings.length; i += 1) {
			if (subsprings[i](value)) active = true;
		}

		if (!active) {
			object[key] = b;
			return false;
		}

		object[key] = value;
		return true;
	};
}

function object(key: string | number, a: object, b: object, options: SpringOptions) {
	const value = {};
	const subsprings = [];

	for (const k in a) {
		subsprings.push(getSpring(k, a[k], b[k], options));
	}

	return (object: any) => {
		let active = false;

		for (let i = 0; i < subsprings.length; i += 1) {
			if (subsprings[i](value)) active = true;
		}

		if (!active) {
			object[key] = b;
			return false;
		}

		object[key] = value;
		return true;
	};
}

function getSpring(key: string | number, a: any, b: any, options: SpringOptions) {
	if (a === b || a !== a) return snap(key, a, b, options);

	const type: string = typeof a;

	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (Array.isArray(a)) {
		if (a.length !== b.length) {
			throw new Error('Cannot interpolate arrays of different length');
		}

		return array(key, a, b, options);
	}

	if (type === 'object') {
		if (!a || !b) throw new Error('Object cannot be null');

		if (isDate(a) && isDate(b)) {
			return date(key, a, b, options);
		}

		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);

		if (!keysMatch(a, b)) throw new Error('Cannot interpolate differently-shaped objects');

		return object(key, a, b, options);
	}

	if (type === 'number') {
		return number(key, a, b, options);
	}

	throw new Error(`Cannot interpolate ${type} values`);
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
					this._springs = null;
				}
			}
			set.call(this, data);
		};
	}

	const spring = getSpring(key, this.get(key), to, options);
	this._springs[key] = spring;

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