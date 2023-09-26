import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import getYoutubeInfo from "./src/youtube-info";
import { Chapter, UpdateMetaPayload, YouTubeInfo } from "./src/types";
import downloadYoutubeAudio from "./src/youtube-download";
import getMetaData from "./src/get-meta";
import updateMetaData from "./src/update-meta";
import createAudioBook from "./src/create-book";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
	? process.env.DIST
	: path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

function createWindow() {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		fullscreenable: false,
		resizable: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
		console.log("Frontend Loaded From: ", VITE_DEV_SERVER_URL);
	} else {
		console.log(
			"Frontend Loaded From: ",
			path.join(process.env.DIST, "index.html")
		);

		// win.loadFile('dist/index.html')
		win.loadFile(path.join(process.env.DIST, "index.html"));
	}

	ipcMain.on("get-youtube-info", async (event, youtubeUrl) => {
		try {
			const youtubeInfo = await getYoutubeInfo(youtubeUrl);

			const responseData = {
				code: "SUCCESS",
				data: youtubeInfo,
			};

			event.sender.send("response-youtube-info", responseData);
		} catch (error) {
			const responseData = {
				code: "FAILURE",
				error,
			};

			event.sender.send("response-youtube-info", responseData);
		}
	});

	ipcMain.on(
		"download-youtube-audio",
		async (event, youtubeInfo: YouTubeInfo) => {
			try {
				await downloadYoutubeAudio(youtubeInfo, event);

				const responseData = {
					code: "SUCCESS",
				};

				event.sender.send("finish-youtube-audio", responseData);
			} catch (error) {
				const responseData = {
					code: "FAILURE",
					error,
				};

				event.sender.send("finish-youtube-audio", responseData);
			}
		}
	);

	ipcMain.on("get-meta-data", async (event) => {
		try {
			const metaData = await getMetaData();

			const responseData = {
				code: "SUCCESS",
				data: metaData,
			};

			event.sender.send("response-meta-data", responseData);
		} catch (error) {
			const responseData = {
				code: "FAILURE",
				error,
			};

			event.sender.send("response-meta-data", responseData);
		}
	});

	ipcMain.on("update-meta-data", async (event, payload: UpdateMetaPayload) => {
		try {
			await updateMetaData(payload);

			const responseData = {
				code: "SUCCESS",
			};

			event.sender.send("finish-update-meta", responseData);
		} catch (error) {
			const responseData = {
				code: "FAILURE",
				error,
			};

			event.sender.send("finish-update-meta", responseData);
		}
	});

	ipcMain.on("add-chapter-data", async (event, chapters: Chapter[]) => {
		try {
			await createAudioBook(chapters);

			const responseData = {
				code: "SUCCESS",
			};

			event.sender.send("book-created", responseData);
		} catch (error) {
			const responseData = {
				code: "FAILURE",
				error,
			};

			event.sender.send("book-created", responseData);
		}
	});
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.whenReady().then(createWindow);
