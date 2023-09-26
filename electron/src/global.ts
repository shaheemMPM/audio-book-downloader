import { promises as fsPromises } from "fs";

async function directoryExists(directoryPath: string): Promise<boolean> {
	try {
		await fsPromises.access(directoryPath);
		return true;
	} catch (error) {
		return false;
	}
}

export { directoryExists };
