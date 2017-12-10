import { Component, Observer, ObserverOptions } from './interfaces';

export function observeMany(
	this: Component,
	keys: string[],
	callback: (newValue: any, oldValue: any) => void,
	opts?: ObserverOptions
) {
	const defer = opts && opts.defer;
	const init = !opts || opts.init !== false;

	let values = init ?
		keys.map(() => undefined) :
		keys.map(key => this.get(key));

	const dispatch = () => {
		const state = this.get();
		const oldValues = values;
		values = keys.map(key => state[key]);

		callback.call(this, values, oldValues);
	};

	if (init) dispatch();

	let n = 0;

	const preObserver = () => {
		if (!n++ && !defer) dispatch();
	};

	const postObserver = () => {
		if (!--n && defer) dispatch();
	};

	const observers: Observer[] = [];

	keys.forEach(key => {
		observers.push(
			this.observe(key, preObserver, { init: false }),
			this.observe(key, postObserver, { init: false, defer: true })
		);
	});

	return {
		cancel() {
			observers.forEach(observer => {
				observer.cancel();
			});
		}
	};
}
