import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DownloadButtonContent from "../components/youtube";
import { IpcResponse, YouTubeInfo } from "../types";

import SendSvg from "../assets/send.svg";
import SpinnerSvg from "../assets/spinner.svg";
import ChevronRightSvg from "../assets/chevron-right.svg";

import "../styles/youtube.css";

function Youtube() {
	const navigateTo = useNavigate();
	const [youtubeUrl, setYoutubeUrl] = useState<string>("");
	const [infoLoading, setInfoLoading] = useState<boolean>(false);
	const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
	const [downloaded, setDownloaded] = useState<boolean>(false);
	const [downloadPercentage, setDownloadPercentage] = useState<number>(0);

	const [videoInfo, setVideoInfo] = useState<YouTubeInfo>();

	const handleGetInfo = () => {
		setInfoLoading(true);
		window.ipcRenderer.send("get-youtube-info", youtubeUrl);
	};

	const handleDownloadAudio = () => {
		setDownloadLoading(true);
		window.ipcRenderer.send("download-youtube-audio", videoInfo);
	};

	useEffect(() => {
		const downloadFinishedListener = (
			_event: Electron.IpcRendererEvent,
			response: IpcResponse<any>
		) => {
			const { code, error } = response;
			if (code === "SUCCESS") {
				setDownloaded(true);
				setDownloadLoading(false);
			} else {
				console.error("Error in finish-youtube-audio: ", error);
			}
		};

		window.ipcRenderer.on("finish-youtube-audio", downloadFinishedListener);
		return () => {
			window.ipcRenderer.removeListener(
				"finish-youtube-audio",
				downloadFinishedListener
			);
		};
	}, []);

	useEffect(() => {
		const downloadProgressListener = (
			_event: Electron.IpcRendererEvent,
			progress: number
		) => {
			setDownloadPercentage(Math.floor(progress));
		};

		window.ipcRenderer.on("progress-youtube-audio", downloadProgressListener);
		return () => {
			window.ipcRenderer.removeListener(
				"progress-youtube-audio",
				downloadProgressListener
			);
		};
	}, []);

	useEffect(() => {
		const youtubeInfoListener = (
			_event: Electron.IpcRendererEvent,
			response: IpcResponse<YouTubeInfo>
		) => {
			const { code, data, error } = response;
			if (code === "SUCCESS") {
				setInfoLoading(false);
				setYoutubeUrl("");
				setVideoInfo(data);
			} else {
				console.error("Error in response-youtube-info: ", error);
			}
		};

		window.ipcRenderer.on("response-youtube-info", youtubeInfoListener);
		return () => {
			window.ipcRenderer.removeListener(
				"response-youtube-info",
				youtubeInfoListener
			);
		};
	}, []);

	return (
		<div className="section">
			<h1 className="page-title">Download From Youtube</h1>
			<div className="flex youtube-url-form">
				<input
					className="input"
					type="text"
					placeholder="Enter Youtube URL"
					value={youtubeUrl}
					onChange={(e) => setYoutubeUrl(e.target.value)}
				/>
				<button
					onClick={handleGetInfo}
					className="btn flex align-center"
					disabled={infoLoading || downloadLoading || !youtubeUrl}
				>
					{infoLoading ? (
						<img
							src={SpinnerSvg}
							alt="Spinner Icon"
							className="svg-icon spinner-svg"
						/>
					) : (
						<img src={SendSvg} alt="Send Icon" className="svg-icon" />
					)}
				</button>
			</div>
			{videoInfo && (
				<div>
					<p className="video-title-text">{videoInfo.title}</p>
					{videoInfo.thumbnail && (
						<img
							className="thumbnail-image"
							src={videoInfo.thumbnail}
							alt={videoInfo.title}
						/>
					)}
					<button
						className="btn flex align-center download-button"
						onClick={handleDownloadAudio}
						disabled={downloaded}
					>
						<DownloadButtonContent
							downloadLoading={downloadLoading}
							downloadPercentage={downloadPercentage}
							downloaded={downloaded}
						/>
					</button>
				</div>
			)}
			<div className="float-bottom">
				<button
					onClick={() => navigateTo("/")}
					className="btn btn-error btn-sm"
				>
					Cancel
				</button>
				<button
					onClick={() => navigateTo("/meta")}
					className="btn btn-success btn-sm flex align-center"
					disabled={!downloaded}
				>
					<p className="m-0 p-0">Add Meta Data</p>
					<img
						src={ChevronRightSvg}
						alt="Chevron Right Icon"
						className="svg-icon ml-h"
					/>
				</button>
			</div>
		</div>
	);
}

export default Youtube;
