import { Component, Observer, ObserverOptions } from './interfaces';

export function observeMany(
	this: Component,
	keys: string[],
	callback: (newValue: any, oldValue: any) => void,
	opts?: ObserverOptions
) {
	const fn = callback.bind(this);

	if (!opts || opts.init !== false) {
		const state = this.get();
		fn(keys.map(key => state[key]), keys.map(key => undefined));
	}

	return this.on(
		opts && opts.defer ? 'update' : 'state',
		({ changed, current, previous }) => {
			if (!previous) return; // prevent double-firing if observing in oncreate

			let i = keys.length;
			while (i--) {
				if (changed[keys[i]]) {
					fn(keys.map(key => current[key]), keys.map(key => previous[key]));
					return;
				}
			}
		}
	);
}
