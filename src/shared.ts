export function isDate(obj: any) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}
