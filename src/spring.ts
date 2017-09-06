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

class Spring {
	key: string | number;

	stiffness: number;
	damping: number;
	done: boolean;

	constructor(key: string | number, a: any, b: any, options: SpringOptions) {
		this.key = key;

		this.stiffness = options.stiffness;
		this.damping = options.damping;
		this.done = false;
	}

	tick(object: any) {
		// overridden by each implementation
	}
}

class SnapSpring extends Spring {
	target: any;

	constructor(key: string | number, a: any, b: any, options: SpringOptions) {
		super(key, a, b, options);
		this.target = b;
	}

	tick(object: any) {
		object[this.key] = this.target;
		return false;
	}
}

class NumericSpring extends Spring {
	value: number;
	target: number;
	velocity: number;

	valueThreshold: number;
	velocityThreshold: number;

	constructor(key: string | number, a: number, b: number, options: SpringOptions) {
		super(key, a, b, options);

		this.value = a;
		this.target = b;
		this.velocity = 0;

		this.valueThreshold = Math.abs(b - a) * 0.01;
		this.velocityThreshold = this.valueThreshold; // TODO is this right?
	}

	tick(object: any) {
		const d = this.target - this.value;
		const spring = this.stiffness * d;
		const damper = this.damping * this.velocity;

		const acceleration = spring - damper;

		this.velocity += acceleration;
		this.value += this.velocity;

		object[this.key] = this.value;

		if (
			this.velocity < this.velocityThreshold &&
			Math.abs(this.target - this.value) < this.valueThreshold
		) {
			object[this.key] = this.target;
			return false;
		}

		object[this.key] = this.value;
		return true;
	}
}

class DateSpring extends Spring {
	dummy: {};
	target: Date;
	subspring: NumericSpring;

	constructor(key: string | number, a: Date, b: Date, options: SpringOptions) {
		super(key, a, b, options);
		this.dummy = {};
		this.target = b;
		this.subspring = new NumericSpring(key, a.getTime(), b.getTime(), options);
	}

	tick(object: any) {
		if (!this.subspring.tick(this.dummy)) {
			object[this.key] = this.target;
			return false;
		}

		object[this.key] = new Date(this.subspring.value);
		return true;
	}
}

class ArraySpring extends Spring {
	value: object;
	target: object;
	subsprings: Spring[];

	constructor(key: string | number, a: any[], b: any[], options: SpringOptions) {
		super(key, a, b, options);

		this.value = [];
		this.target = b;
		this.subsprings = [];

		for (let i = 0; i < a.length; i += 1) {
			this.subsprings.push(getSpring(i, a[i], b[i], options));
		}
	}

	tick(object: any) {
		let active = false;

		for (let i = 0; i < this.subsprings.length; i += 1) {
			if (this.subsprings[i].tick(this.value)) active = true;
		}

		if (!active) {
			object[this.key] = this.target;
			return false;
		}

		object[this.key] = this.value;
		return true;
	}
}

class ObjectSpring extends Spring {
	value: object;
	target: object;
	subsprings: Spring[];

	constructor(key: string | number, a: object, b: object, options: SpringOptions) {
		super(key, a, b, options);

		this.value = {};
		this.target = b;
		this.subsprings = [];

		for (const k in a) {
			this.subsprings.push(getSpring(k, a[k], b[k], options));
		}
	}

	tick(object: any) {
		let active = false;

		for (let i = 0; i < this.subsprings.length; i += 1) {
			if (this.subsprings[i].tick(this.value)) active = true;
		}

		if (!active) {
			object[this.key] = this.target;
			return false;
		}

		object[this.key] = this.value;
		return true;
	}
}

function getSpring(key: string | number, a: any, b: any, options: SpringOptions) {
	if (a === b || a !== a) return new SnapSpring(key, a, b, options);

	const type: string = typeof a;

	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (Array.isArray(a)) {
		if (a.length !== b.length) {
			throw new Error('Cannot interpolate arrays of different length');
		}

		return new ArraySpring(key, a, b, options);
	}

	if (type === 'object') {
		if (!a || !b) throw new Error('Object cannot be null');

		if (isDate(a) && isDate(b)) {
			return new DateSpring(key, a, b, options);
		}

		const aKeys = Object.keys(a);
		const bKeys = Object.keys(b);

		if (!keysMatch(a, b)) throw new Error('Cannot interpolate differently-shaped objects');

		return new ObjectSpring(key, a, b, options);
	}

	if (type === 'number') {
		return new NumericSpring(key, a, b, options);
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
					if (this._springs[key]) this._springs[key].abort();
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