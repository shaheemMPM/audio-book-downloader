export interface YouTubeInfo {
	videoUrl: string;
	videoId: string;
	title: string;
	thumbnail?: string;
	thumbnailBase64?: string;
	audio?: string;
}

export interface IpcResponse<T> {
	code: string;
	data?: T;
	error?: any;
}
