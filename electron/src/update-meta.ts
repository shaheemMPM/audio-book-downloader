import { promises as fsPromises } from "fs";
import path from "path";
import os from "os";
import { directoryExists } from "./global";
import { UpdateMetaPayload, YouTubeInfo } from "./types";

async function deleteFile(path?: string) {
	if (!path) return;

	if (await directoryExists(path)) {
		await fsPromises.unlink(path);
	}
}

function getExtensionFromPath(path: string) {
	const parts = path.split(".");
	const lastPart = parts[parts.length - 1];
	const extension = lastPart.split("?")[0].split("#")[0];

	return extension.toLowerCase();
}

async function copyFile(sourceFilePath: string, destinationFilePath: string) {
	try {
		await fsPromises.copyFile(sourceFilePath, destinationFilePath);
	} catch (err) {
		throw new Error("Copy File Failed");
	}
}

async function updateMetaData(payload: UpdateMetaPayload) {
	try {
		const { title, userCover, author } = payload;

		const rootDirectory = os.homedir();
		const workingFilesPath = path.join(
			rootDirectory,
			"Audio Book Builder",
			"WorkingFiles"
		);
		const metaDataPath = path.join(workingFilesPath, "data.json");

		if (!(await directoryExists(metaDataPath))) {
			throw new Error("Meta data file doesn't exist");
		}

		const data = await fsPromises.readFile(metaDataPath, "utf-8");
		const metaData: YouTubeInfo = JSON.parse(data);

		metaData.title = title;
		metaData.author = author;

		if (userCover === "no-change") {
		} else if (userCover === "remove") {
			await deleteFile(metaData.thumbnail);
			metaData.thumbnail = "";
		} else {
			await deleteFile(metaData.thumbnail);

			const imageExtension = getExtensionFromPath(userCover);
			const imageDestination = path.join(
				workingFilesPath,
				`cover.${imageExtension}`
			);

			await copyFile(userCover, imageDestination);
			metaData.thumbnail = imageDestination;
		}

		await fsPromises.writeFile(metaDataPath, JSON.stringify(metaData, null, 2));
	} catch (error) {
		throw error;
	}
}

export default updateMetaData;
