export interface Component {
	set(data: {}): void;
	get(key?: string): any;
	observe(
		key: string,
		callback: (newValue: any, oldValue: any) => void,
		options?: ObserverOptions
	): Observer;
}

export interface Observer {
	cancel: () => void;
}

export interface ObserverOptions {
	init?: boolean;
	defer?: boolean;
}
