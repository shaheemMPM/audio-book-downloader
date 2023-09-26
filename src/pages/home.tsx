import { useNavigate } from "react-router-dom";
import YoutubeLogo from "../assets/youtube.png";
import Mp3Logo from "../assets/mp3.png";
import Mp4Logo from "../assets/mp4.png";

import "../styles/home.css";

function Home() {
	const navigateTo = useNavigate();

	return (
		<div className="section flex justify-between align-center flex-column">
			<h1 className="page-title">Select Source</h1>

			<div className="flex w-90 justify-around">
				<a href="#" onClick={() => navigateTo("/youtube")}>
					<img src={YoutubeLogo} className="logo youtube" alt="Youtube logo" />
				</a>
				<a href="#" onClick={() => navigateTo("/mp3")}>
					<img src={Mp3Logo} className="logo mp3" alt="MP3 logo" />
				</a>
				<a href="#" onClick={() => navigateTo("/mp4")}>
					<img src={Mp4Logo} className="logo mp4" alt="MP4 logo" />
				</a>
			</div>

			<p className="page-footer">
				Click on the source from which you want to create audio book
			</p>
		</div>
	);
}

export default Home;
