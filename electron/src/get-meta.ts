import { promises as fsPromises } from "fs";
import path from "path";
import os from "os";
import { directoryExists } from "./global";

async function getMetaData() {
	try {
		const rootDirectory = os.homedir();
		const metaDataPath = path.join(
			rootDirectory,
			"Audio Book Builder",
			"WorkingFiles",
			"data.json"
		);

		if (!(await directoryExists(metaDataPath))) {
			throw new Error("Meta data file doesn't exist");
		}

		const data = await fsPromises.readFile(metaDataPath, "utf-8");
		const metaData = JSON.parse(data);

		const thumbnailPath = metaData.thumbnail;
		const thumbnailBuffer = await fsPromises.readFile(thumbnailPath);
		const thumbnailBase64 = thumbnailBuffer.toString("base64");

		metaData.thumbnailBase64 = `data:image/png;base64,${thumbnailBase64}`;

		return metaData;
	} catch (error) {
		throw error;
	}
}

export default getMetaData;
