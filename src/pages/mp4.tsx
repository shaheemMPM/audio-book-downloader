import { useNavigate } from "react-router-dom";

import "../styles/mp4.css";

function Mp4() {
	const navigateTo = useNavigate();

	return (
		<div className="section">
			<h1 className="page-title">Download From MP4</h1>
			<div className="float-bottom">
				<button
					onClick={() => navigateTo("/")}
					className="btn btn-error btn-sm"
				>
					Cancel
				</button>
				<button className="btn btn-success btn-sm" disabled>
					Next
				</button>
			</div>
		</div>
	);
}

export default Mp4;
