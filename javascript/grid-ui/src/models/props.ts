export interface BasePropsType {
	history: {
		action: string;
		length: number;
	};
	location: {
		hash: string;
		pathname: string;
		search: string;
		state: any;
	};
	match: {
		isExact: boolean;
		params: { [key: string]: string };
		path: string;
		url: string;
	};
}
