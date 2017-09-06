import Component from './interfaces.ts';

const THRESHOLD = 0.001;

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

				spring.tick();

				if (spring.done) { // TODO???
					data[key] = spring.target;
					delete component._springs[key];
					spring.fulfil();
				} else {
					hasSprings = true;
					hasComponents = true;
					data[key] = spring.value;
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

class NumericSpring {
	key: string;
	value: number;
	target: number;

	stiffness: number;
	damping: number;
	velocity: number;
	done: boolean;

	fulfil: () => void;
	reject: (err: Error) => void;

	constructor(key: string, a: number, b: number, options: SpringOptions) {
		this.key = key;
		this.value = a;
		this.target = b;

		this.fulfil = null;
		this.reject = null;

		this.stiffness = options.stiffness;
		this.damping = options.damping;
		this.velocity = 0;
		this.done = false;
	}

	tick() {
		const d = this.target - this.value;
		const spring = this.stiffness * d;
		const damper = this.damping * this.velocity;

		const acceleration = spring - damper;

		this.velocity += acceleration;
		this.value += this.velocity;

		if (this.velocity < THRESHOLD && Math.abs(this.target - this.value) < THRESHOLD) {
			this.done = true;
		}
	}
}

export function spring(this: Component, key: string, to: any, options: SpringOptions) {
	if (!this._springs) {
		this._springs = Object.create(null);
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

	let spring = this._springs[key];
	if (spring) {
		spring.reject(new Error(`'${key}' pring was given a new target value`));
		spring.target = to; // TODO verify the types match
		spring.stiffness = options.stiffness;
		spring.damping = options.damping;
	} else {
		spring = new NumericSpring(key, this.get(key), to, options);
		this._springs[key] = spring;
	}

	scheduler.add(this);

	let running;

	return new Promise((fulfil, reject) => {
		spring.fulfil = fulfil;
		spring.reject = reject;
	});
}