import { Component, Observer, ObserverOptions } from './interfaces';

export function observe(
	this: Component,
	key: string,
	callback: (newValue: any, oldValue: any) => void,
	opts?: ObserverOptions
) {
	const fn = callback.bind(this);

	if (!opts || opts.init !== false) {
		fn(this.get()[key]);
	}

	return this.on(
		opts && opts.defer ? 'update' : 'state',
		({ changed, current, previous }) => {
			if (changed[key]) fn(current[key], previous && previous[key]);
		}
	);
}
