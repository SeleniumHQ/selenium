import * as Replacer from "findandreplacedomtext";

const searchHighlight = (search: string) => {
	/* 	TODO
		Consider using Lunr.js for improved search performance
	 */
	return Replacer(document.body, {
		find: new RegExp(search, "ig"),
		wrap: "mark",
		wrapClass: "highlight",
	});
};

export default searchHighlight;
