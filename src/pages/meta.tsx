import { useNavigate } from "react-router-dom";

import PlusSquareSvg from "../assets/plus-square.svg";
import TrashSvg from "../assets/trash.svg";
import ChevronRightSvg from "../assets/chevron-right.svg";

import "../styles/meta.css";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { IpcResponse, YouTubeInfo } from "../types";

function Meta() {
	const navigateTo = useNavigate();
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [bookTitle, setBookTitle] = useState<string>("");
	const [bookAuthor, setBookAuthor] = useState<string>("");
	const [bookCoverImage, setBookCoverImage] = useState<string>("");
	const [userSelectedCoverPath, setUserSelectedCoverPath] =
		useState<string>("");

	const handleDeleteCover = () => {
		setBookCoverImage("");
	};

	const handleSelectImage = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = e.target.files;

		if (selectedFiles && selectedFiles.length > 0) {
			setUserSelectedCoverPath(selectedFiles[0].path);

			const reader = new FileReader();
			reader.onload = (event) => {
				const base64ImageString = event.target?.result as string;
				setBookCoverImage(base64ImageString);
			};

			reader.readAsDataURL(selectedFiles[0]);
		}
	};

	const handleUpdateMetaData = () => {
		const payload = {
			title: bookTitle,
			author: bookAuthor,
			userCover: "no-change",
		};

		if (!bookCoverImage) payload.userCover = "remove";
		if (userSelectedCoverPath) payload.userCover = userSelectedCoverPath;

		window.ipcRenderer.send("update-meta-data", payload);
	};

	useEffect(() => {
		window.ipcRenderer.send("get-meta-data");
	}, []);

	useEffect(() => {
		const updateFinishedListener = (
			_event: Electron.IpcRendererEvent,
			response: IpcResponse<any>
		) => {
			const { code, error } = response;
			if (code === "SUCCESS") {
				navigateTo("/chapter");
			} else {
				console.error("Error in finish-update-meta: ", error);
			}
		};

		window.ipcRenderer.on("finish-update-meta", updateFinishedListener);
		return () => {
			window.ipcRenderer.removeListener(
				"finish-update-meta",
				updateFinishedListener
			);
		};
	}, []);

	useEffect(() => {
		const videoMetaDataListener = (
			_event: Electron.IpcRendererEvent,
			response: IpcResponse<YouTubeInfo>
		) => {
			const { code, data, error } = response;
			if (code === "SUCCESS") {
				setBookTitle(data?.title || "");
				setBookCoverImage(data?.thumbnailBase64 || "");
			} else {
				console.error("Error in response-meta-data: ", error);
			}
		};

		window.ipcRenderer.on("response-meta-data", videoMetaDataListener);
		return () => {
			window.ipcRenderer.removeListener(
				"response-meta-data",
				videoMetaDataListener
			);
		};
	}, []);

	return (
		<div className="section">
			<h1 className="page-title">Audio Meta Datas</h1>
			<form className="meta-form">
				<div className="form-item">
					<label htmlFor="ipMetaTitle">Title*</label>
					<input
						value={bookTitle}
						onChange={(e) => setBookTitle(e.target.value)}
						className="input"
						type="text"
						id="ipMetaTitle"
						name="ipMetaTitle"
						placeholder="Enter Book Title"
						required
					/>
				</div>
				<div className="form-item">
					<label htmlFor="ipMetaAuthor">Author</label>
					<input
						value={bookAuthor}
						onChange={(e) => setBookAuthor(e.target.value)}
						className="input"
						type="text"
						id="ipMetaAuthor"
						name="ipMetaAuthor"
						placeholder="Enter Author Name"
					/>
				</div>
				<div className="form-item">
					<label htmlFor="ipMetaCover">Cover Image</label>
					{bookCoverImage && (
						<div className="cover-image-container">
							<img
								className="cover-image-preview"
								src={bookCoverImage}
								alt={bookTitle}
							/>
							<button
								onClick={handleDeleteCover}
								className="delete-button btn btn-error btn-sm flex align-center"
							>
								<img src={TrashSvg} alt="Trash Icon" className="svg-icon" />
							</button>
						</div>
					)}
					{!bookCoverImage && (
						<div onClick={handleSelectImage} className="input-cover-button">
							<img src={PlusSquareSvg} alt="Plus Icon" />
						</div>
					)}
				</div>
			</form>
			<div className="float-bottom">
				<button
					onClick={() => navigateTo("/")}
					className="btn btn-error btn-sm"
				>
					Cancel
				</button>
				<button
					onClick={handleUpdateMetaData}
					className="btn btn-success btn-sm flex align-center"
					disabled={!bookTitle}
				>
					<p className="m-0 p-0">Add Chapters</p>
					<img
						src={ChevronRightSvg}
						alt="Chevron Right Icon"
						className="svg-icon ml-h"
					/>
				</button>
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				style={{ display: "none" }}
				onChange={handleFileChange}
			/>
		</div>
	);
}

export default Meta;
