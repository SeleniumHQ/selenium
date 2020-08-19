interface RingDetails {
	count: number;
	progresses: { [key: number]: { color: string; progress: number } };
}

export default RingDetails;
