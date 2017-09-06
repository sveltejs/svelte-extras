export function isDate(obj) {
	return obj instanceof Date;
	// return Object.prototype.toString.call(obj) === '[object Date]';
}