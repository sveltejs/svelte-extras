export interface Component {
	set(data: {}): void;
	get(key?: string): any;
	observe(
		key: string,
		callback: (newValue: any, oldValue: any) => void,
		options?: ObserverOptions
	): Observer;

	_currentTweens?: Record<string, any>; // TODO
	_tweening?: boolean;

	_springs?: Record<string, any>; // TODO
	_springCallbacks?: Record<string, () => void>;
	_springing?: boolean;
}

export interface Observer {
	cancel: () => void;
}

export interface ObserverOptions {
	init?: boolean;
	defer?: boolean;
}
