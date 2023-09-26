import { promises as fsPromises } from "fs";
const { exec } = require("child_process");
import path from "path";
import os from "os";
import util from "util";
const ffmpeg = require("fluent-ffmpeg");

const ffprobeAsync = util.promisify(ffmpeg.ffprobe);
const execAsync = util.promisify(exec);

import { directoryExists } from "./global";
import { Chapter, YouTubeInfo } from "./types";

function convertChapters(inputChapters: Chapter[]) {
	const chapters = [];

	for (const chapter of inputChapters) {
		const timeComponents = chapter.timestamp.split(":").map(Number);

		if (timeComponents.length === 2) {
			// Format: [minute, second]
			const [minute, second] = timeComponents;
			const timestamp = minute * 60 + second;
			chapters.push({ timestamp, name: chapter.name });
		} else if (timeComponents.length === 3) {
			// Format: [hour, minute, second]
			const [hour, minute, second] = timeComponents;
			const timestamp = hour * 3600 + minute * 60 + second;
			chapters.push({ timestamp, name: chapter.name });
		}
	}

	return chapters;
}

async function cleanupDirectory(directoryPath: string) {
	try {
		const fileNames = await fsPromises.readdir(directoryPath);

		for (const fileName of fileNames) {
			const filePath = path.join(directoryPath, fileName);
			await fsPromises.unlink(filePath);
		}
	} catch (error) {
		throw error;
	}
}

async function createDirectoryIfNotExists(directoryPath: string) {
	if (!(await directoryExists(directoryPath))) {
		await fsPromises.mkdir(directoryPath);
	}
}

async function createAudioBook(chapters: Chapter[]) {
	try {
		const chapterData = convertChapters(chapters);

		const rootDirectory = os.homedir();
		const audioBookBuilderPath = path.join(rootDirectory, "Audio Book Builder");
		const workingFilesPath = path.join(audioBookBuilderPath, "WorkingFiles");
		const metaDataPath = path.join(workingFilesPath, "data.json");

		if (!(await directoryExists(metaDataPath))) {
			throw new Error("Meta data file doesn't exist");
		}

		const data = await fsPromises.readFile(metaDataPath, "utf-8");
		const metaData: YouTubeInfo = JSON.parse(data);

		const audioMp4Path = metaData.audio;

		const metadata = await ffprobeAsync(audioMp4Path);

		const videoDuration: number = metadata.format.duration;

		const mp3SegmentsPath = path.join(workingFilesPath, "segments");

		await createDirectoryIfNotExists(mp3SegmentsPath);
		await cleanupDirectory(mp3SegmentsPath);

		for (let index = 0; index < chapterData.length; index++) {
			const chapter = chapterData[index];

			const start = chapter.timestamp;
			const end =
				index < chapterData.length - 1
					? chapterData[index + 1].timestamp
					: videoDuration;

			const chapterNumber = (index + 1).toString().padStart(2, "0");
			const mp3FileName = path.join(
				mp3SegmentsPath,
				`${chapterNumber} - ${chapter.name}.mp3`
			);

			await new Promise((resolve, reject) => {
				const command = ffmpeg(audioMp4Path)
					.setStartTime(start)
					.setDuration(end - start)
					.audioCodec("libmp3lame")
					.audioChannels(2)
					.audioFrequency(44100)
					.audioBitrate("128k")
					.audioQuality(0)
					.on("end", () => {
						resolve("");
					})
					.on("error", (err: any) => {
						reject(err);
					});

				command.output(mp3FileName).run();
			});
		}

		const mp3Files = await fsPromises.readdir(mp3SegmentsPath);

		const bookOutputPath = path.join(audioBookBuilderPath, metaData.title);
		await createDirectoryIfNotExists(bookOutputPath);
		await cleanupDirectory(bookOutputPath);

		for (const mp3File of mp3Files) {
			if (mp3File.endsWith(".mp3")) {
				const inputFilePath = path.join(mp3SegmentsPath, mp3File);
				const outputFilePath = path.join(bookOutputPath, mp3File);

				// if (metaData.thumbnail) {
				// 	const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -i "${metaData.thumbnail}" -c copy -map 0 -map 1 "${outputFilePath}"`;
				// 	const { error } = await execAsync(ffmpegCommand);
				// 	if (error) {
				// 		console.log("Error in thumbnail fix: ", error);
				// 		throw new Error("Error adding cover art");
				// 	}
				// }

				// if (metaData.author) {
				// 	const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -metadata title="${metaData.author}" -c:a copy "${outputFilePath}"`;
				// 	const { error } = await execAsync(ffmpegCommand);
				// 	if (error) {
				// 		console.log("Error in author fix: ", error);
				// 		throw new Error("Error adding artist metadata");
				// 	}
				// }

				const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -metadata album="${metaData.title}" -c:a copy "${outputFilePath}"`;
				const { error: albumError } = await execAsync(ffmpegCommand);
				if (albumError) {
					console.log("Error in album fix: ", albumError);
					throw new Error("Error adding album metadata");
				}
			}
		}
	} catch (error) {
		throw error;
	}
}

export default createAudioBook;
