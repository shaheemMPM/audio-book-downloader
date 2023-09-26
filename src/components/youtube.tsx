import SpinnerSvg from "../assets/spinner.svg";
import TickSvg from "../assets/tick.svg";
import DownloadSvg from "../assets/download.svg";

type Props = {
	downloadLoading: boolean;
	downloaded: boolean;
	downloadPercentage: number;
};

const DownloadButtonContent = ({
	downloadLoading,
	downloaded,
	downloadPercentage,
}: Props) => {
	if (downloadLoading) {
		return (
			<>
				<img
					src={SpinnerSvg}
					alt="Spinner Icon"
					className="svg-icon spinner-svg"
				/>
				<p className="m-0 p-0 ml-1">Downloaded {downloadPercentage}%</p>
			</>
		);
	}
	if (downloaded) {
		return (
			<>
				<img src={TickSvg} alt="Tick Icon" className="svg-icon" />
				<p className="m-0 p-0 ml-1">Audio Downloaded</p>
			</>
		);
	}
	return (
		<>
			<img src={DownloadSvg} alt="Download Icon" className="svg-icon" />
			<p className="m-0 p-0 ml-1">Download</p>
		</>
	);
};

export default DownloadButtonContent;
