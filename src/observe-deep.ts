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
	const key = parts.shift();
	let last: any =
		opts && opts.init === false
			? getNestedValue(this.get(key), parts)
			: undefined;

	return this.observe(
		key,
		value => {
			value = getNestedValue(value, parts);
			if (
				value !== last ||
				typeof value === 'object' ||
				typeof value === 'function'
			) {
				callback.call(this, value, last);
			}
			last = value;
		},
		opts
	);
}
