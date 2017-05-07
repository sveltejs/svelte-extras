export interface Component {
	set(data: {}): void
	get(key?: string): any
}