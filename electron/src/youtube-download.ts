import ytdl from "ytdl-core";
import os from "os";
import path from "path";
import axios from "axios";
import { promises as fsPromises, createWriteStream } from "fs";
import { directoryExists } from "./global";
import { YouTubeInfo } from "./types";

async function createDirectoryIfNotExists(directoryPath: string) {
	if (!(await directoryExists(directoryPath))) {
		await fsPromises.mkdir(directoryPath);
	}
}

function getExtensionFromUrl(url: string) {
	const parts = url.split(".");
	const lastPart = parts[parts.length - 1];
	const extension = lastPart.split("?")[0].split("#")[0];

	return extension.toLowerCase();
}

async function downloadThumbnail(
	thumbnailUrl: string,
	destinationPath: string
) {
	try {
		const response = await axios.get(thumbnailUrl, {
			responseType: "arraybuffer",
		});

		const thumbnailExtension = getExtensionFromUrl(thumbnailUrl);
		const fileName = `cover.${thumbnailExtension}`;
		const imagePath = path.join(destinationPath, fileName);

		await fsPromises.writeFile(imagePath, response.data);

		return imagePath;
	} catch (error) {
		throw error;
	}
}

async function cleanupDirectory(directoryPath: string) {
	try {
		const fileNames = await fsPromises.readdir(directoryPath);

		for (const fileName of fileNames) {
			const filePath = path.join(directoryPath, fileName);
			const stats = await fsPromises.stat(filePath);

			if (stats.isFile()) {
				await fsPromises.unlink(filePath);
			} else if (stats.isDirectory()) {
				await cleanupDirectory(filePath);
				await fsPromises.rmdir(filePath);
			}
		}
	} catch (error) {
		throw error;
	}
}

async function downloadYoutubeAudio(
	videoInfo: YouTubeInfo,
	event: Electron.IpcMainEvent
) {
	try {
		const rootDirectory = os.homedir();
		const audioBookBuilderPath = path.join(rootDirectory, "Audio Book Builder");
		const workingFilesPath = path.join(audioBookBuilderPath, "WorkingFiles");

		await createDirectoryIfNotExists(audioBookBuilderPath);
		await createDirectoryIfNotExists(workingFilesPath);

		await cleanupDirectory(workingFilesPath);

		const { thumbnail } = videoInfo;
		let thumbnailPath = "";
		if (thumbnail) {
			thumbnailPath = await downloadThumbnail(thumbnail, workingFilesPath);
		}

		const audioFilePath = path.join(workingFilesPath, "audio.mp4");
		const audioStream = ytdl(videoInfo.videoUrl, { filter: "audioonly" });

		const fileStream = createWriteStream(audioFilePath);

		audioStream.on("progress", (_chunkLength, downloaded, total) => {
			const percent = (downloaded / total) * 100;
			event.sender.send("progress-youtube-audio", percent);
		});

		audioStream.pipe(fileStream);

		await new Promise<void>((resolve) => {
			fileStream.on("finish", resolve);
		});

		videoInfo.thumbnail = thumbnailPath;
		videoInfo.audio = audioFilePath;

		const dataFilePath = path.join(workingFilesPath, "data.json");
		await fsPromises.writeFile(
			dataFilePath,
			JSON.stringify(videoInfo, null, 2)
		);
	} catch (error) {
		throw error;
	}
}

export default downloadYoutubeAudio;
