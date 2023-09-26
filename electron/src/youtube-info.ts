import ytdl from "ytdl-core";
import { YouTubeInfo } from "./types";

async function getYoutubeInfo(videoUrl: string): Promise<YouTubeInfo> {
	try {
		const videoId = ytdl.getURLVideoID(videoUrl);
		const videoInfo: any = await ytdl.getInfo(videoId);

		const videoTitle = videoInfo.player_response.videoDetails.title;
		const videoThumbnails =
			videoInfo.player_response.videoDetails.thumbnail.thumbnails;

		const hdThumbnail =
			videoThumbnails.length > 0
				? videoThumbnails[videoThumbnails.length - 1].url
				: "";

		return {
			videoUrl,
			videoId,
			title: videoTitle,
			thumbnail: hdThumbnail,
		};
	} catch (error) {
		throw error;
	}
}

export default getYoutubeInfo;
