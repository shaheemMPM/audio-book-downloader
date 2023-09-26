export interface YouTubeInfo {
	videoUrl: string;
	videoId: string;
	title: string;
	thumbnail?: string;
	thumbnailBase64?: string;
	audio?: string;
	author?: string;
}

export interface UpdateMetaPayload {
	title: string;
	author?: string;
	userCover: string;
}
