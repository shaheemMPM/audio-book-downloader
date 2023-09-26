import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chapter, IpcResponse } from "../types";

import PlusSquareWhite from "../assets/plus-square-white.svg";
import SpinnerSvg from "../assets/spinner.svg";

import "../styles/chapter.css";

function AddChapter() {
	const navigateTo = useNavigate();

	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleAddChapter = () => {
		setChapters((currentChapters) => [
			...currentChapters,
			{ name: "", timestamp: "" },
		]);
	};

	const handleChapterNameChange = (index: number, value: string) => {
		setChapters((currentChapters) => {
			const newChapters = [...currentChapters];
			newChapters[index].name = value;
			return newChapters;
		});
	};

	const handleChapterTimestampChange = (index: number, value: string) => {
		setChapters((currentChapters) => {
			const newChapters = [...currentChapters];
			newChapters[index].timestamp = value;
			return newChapters;
		});
	};

	const handleCreateAudioBook = () => {
		setIsLoading(true);
		window.ipcRenderer.send("add-chapter-data", chapters);
	};

	useEffect(() => {
		const bookCreatedListener = (
			_event: Electron.IpcRendererEvent,
			response: IpcResponse<any>
		) => {
			const { code, error } = response;
			if (code === "SUCCESS") {
				setIsLoading(false);
			} else {
				console.error("Error in book-created: ", error);
			}
		};

		window.ipcRenderer.on("book-created", bookCreatedListener);
		return () => {
			window.ipcRenderer.removeListener("book-created", bookCreatedListener);
		};
	}, []);

	return (
		<div className="section">
			<h1 className="page-title">Chapters</h1>

			<div className="table-container">
				<div className="table-header">
					<div className="table-header-cell">Chapter Name</div>
					<div className="table-header-cell">Timestamp</div>
				</div>
				<div className="table-body">
					{chapters.length === 0 && (
						<div className="table-row">
							<p className="placeholder-p">Add Chapters</p>
						</div>
					)}
					{chapters.map((chapter, ind) => {
						return (
							<div className="table-row" key={ind}>
								<div className="table-cell">
									<input
										placeholder="Chapter name"
										className="input table-input"
										type="text"
										value={chapter.name}
										onChange={(e) =>
											handleChapterNameChange(ind, e.target.value)
										}
									/>
								</div>
								<div className="table-cell">
									<input
										placeholder="Timestamp (0:00)"
										className="input table-input"
										type="text"
										value={chapter.timestamp}
										onChange={(e) =>
											handleChapterTimestampChange(ind, e.target.value)
										}
									/>
								</div>
							</div>
						);
					})}
				</div>
				<div className="table-footer">
					<button
						onClick={handleAddChapter}
						className="btn btn-sm flex align-center"
					>
						<img src={PlusSquareWhite} alt="Plus Icon" className="svg-icon" />
						<p className="m-0 p-0 ml-1">Add Chapter</p>
					</button>
				</div>
			</div>

			<div className="float-bottom">
				<button
					onClick={() => navigateTo("/")}
					className="btn btn-error btn-sm"
				>
					Cancel
				</button>
				<button
					onClick={handleCreateAudioBook}
					className="btn btn-success btn-sm"
				>
					Create Audio Book
				</button>
			</div>

			{isLoading && (
				<div className="loading-overlay">
					<img
						src={SpinnerSvg}
						alt="Spinner Icon"
						className="overlay-spinner spinner-svg"
					/>
				</div>
			)}
		</div>
	);
}

export default AddChapter;
