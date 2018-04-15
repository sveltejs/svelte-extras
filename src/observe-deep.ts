import { Component, Observer, ObserverOptions } from './interfaces';

function getNestedValue(obj: any, parts: string[]): any {
	for (let i = 0; i < parts.length; i += 1) {
		if (!obj) return undefined;
		obj = obj[parts[i]];
	}

	return obj;
}

export function observeDeep(
	this: Component,
	keypath: string,
	callback: (newValue: any, oldValue: any) => void,
	opts?: ObserverOptions
) {
	const parts = keypath.replace(/\[(\d+)\]/g, '.$1').split('.');
	const [key] = parts;
	const fn = callback.bind(this);

	let last: any = getNestedValue(this.get(), parts);

	if (!opts || opts.init !== false) fn(last);

	return this.on(opts && opts.defer ? 'update' : 'state', ({ changed, current, previous }) => {
		if (changed[key]) {
			const value = getNestedValue(current, parts);
			if (value !== last || typeof value === 'object' || typeof value === 'function') {
				fn(value, last);
				last = value;
			}
		}
	});
}
