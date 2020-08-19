import chromeLogo from "../assets/browsers/chrome.svg";
import firefoxLogo from "../assets/browsers/firefox.svg";
import ieLogo from "../assets/browsers/internet-explorer.svg";
import edgehtmlLogo from "../assets/browsers/edge.svg";
import edgeNewLogo from "../assets/browsers/edge-new.svg";
import operaLogo from "../assets/browsers/opera.svg";
import safariLogo from "../assets/browsers/safari.svg";
import unknownLogo from "../assets/browsers/unknown.svg";

/* Added from https://github.com/SeleniumHQ/selenium/blob/1fce6ddd50ec795260c1717b1f9f15bf97faf673/java/client/src/org/openqa/selenium/remote/BrowserType.java#L23 */
export const BrowserTypes: { [key: string]: string } = {
	FIREFOX: "firefox",
	GOOGLECHROME: "googlechrome",
	SAFARI: "safari",
	OPERA: "opera",
	EDGE: "MicrosoftEdge",
	EDGEHTML: "EdgeHTML",
	IEXPLORE: "iexplore",
	CHROME: "chrome",
	IE: "internet explorer",
};

let reverseMap: { [key: string]: string } = {};
Object.keys(BrowserTypes).forEach((k) => {
	reverseMap = { ...reverseMap, [BrowserTypes[k]]: k };
});

export function getLogo(browserName: string): string {
	if (Object.values(BrowserTypes).includes(browserName)) {
		return Logos[reverseMap[browserName]];
	}

	return unknownLogo;
}

export const Logos: { [key: string]: string } = {
	FIREFOX: firefoxLogo,
	GOOGLECHROME: chromeLogo,
	SAFARI: safariLogo,
	OPERA: operaLogo,
	EDGE: edgeNewLogo,
	EDGEHTML: edgehtmlLogo,
	IEXPLORE: ieLogo,
	CHROME: chromeLogo,
	IE: ieLogo,
};
