import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Youtube from "./pages/youtube";
import Mp3 from "./pages/mp3";
import Mp4 from "./pages/mp4";
import Meta from "./pages/meta";
import AddChapter from "./pages/chapter";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/youtube" element={<Youtube />} />
			<Route path="/mp3" element={<Mp3 />} />
			<Route path="/mp4" element={<Mp4 />} />
			<Route path="/meta" element={<Meta />} />
			<Route path="/chapter" element={<AddChapter />} />
		</Routes>
	);
}

export default App;
