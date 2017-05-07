import Component from './interfaces.ts';

const arrayNotationPattern = /\[\s*(\d+)\s*\]/g;

function makeArrayMethod(name: string) {
	return function(this:Component, keypath: string, ...args: any[]) {
		const parts = keypath.replace(arrayNotationPattern, '.$1').split('.');

		const key = parts.shift();
		const value = this.get(key);

		let array = value;
		while (parts.length)
			array = array[parts.shift()];

		const result = array[name](...args);
		this.set({ [key]: value });

		return result;
	};
}

export const push = makeArrayMethod( 'push' );
export const pop = makeArrayMethod( 'pop' );
export const shift = makeArrayMethod( 'shift' );
export const unshift = makeArrayMethod( 'unshift' );
export const splice = makeArrayMethod( 'splice' );
export const sort = makeArrayMethod( 'sort' );
export const reverse = makeArrayMethod( 'reverse' );
