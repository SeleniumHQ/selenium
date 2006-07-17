/*
	cssQuery, version 2.0.2 (2005-08-19)
	Copyright: 2004-2005, Dean Edwards (http://dean.edwards.name/)
	License: http://creativecommons.org/licenses/LGPL/2.1/
*/

cssQuery.addModule("css-standard", function() { // override IE optimisation

// cssQuery was originally written as the CSS engine for IE7. It is
//  optimised (in terms of size not speed) for IE so this module is
//  provided separately to provide cross-browser support.

// -----------------------------------------------------------------------
// browser compatibility
// -----------------------------------------------------------------------

// sniff for Win32 Explorer
isMSIE = eval("false;/*@cc_on@if(@\x5fwin32)isMSIE=true@end@*/");

if (!isMSIE) {
	getElementsByTagName = function($element, $tagName, $namespace) {
		return $namespace ? $element.getElementsByTagNameNS("*", $tagName) :
			$element.getElementsByTagName($tagName);
	};

	compareNamespace = function($element, $namespace) {
		return !$namespace || ($namespace == "*") || ($element.prefix == $namespace);
	};

	isXML = document.contentType ? function($element) {
		return /xml/i.test(getDocument($element).contentType);
	} : function($element) {
		return getDocument($element).documentElement.tagName != "HTML";
	};

	getTextContent = function($element) {
		// mozilla || opera || other
		return $element.textContent || $element.innerText || _getTextContent($element);
	};

	function _getTextContent($element) {
		var $textContent = "", $node, i;
		for (i = 0; ($node = $element.childNodes[i]); i++) {
			switch ($node.nodeType) {
				case 11: // document fragment
				case 1: $textContent += _getTextContent($node); break;
				case 3: $textContent += $node.nodeValue; break;
			}
		}
		return $textContent;
	};
}
}); // addModule
