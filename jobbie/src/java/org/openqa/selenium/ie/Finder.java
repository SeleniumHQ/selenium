package org.openqa.selenium.ie;

import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.WebElement;

// Kept package level deliberately.
class Finder {
	public static WebElement findElementById(long iePointer, long underlyingDomNode, String using) {
		return selectElementById(iePointer, underlyingDomNode, using);
	}
	private static native WebElement selectElementById(long iePointer, long underlyingDomNode, String using);

	public static List<WebElement> findElementsById(long underlyingDomNode, String using) {
		List<WebElement> rawElements = new ArrayList<WebElement>();
		selectElementsById(underlyingDomNode, using, rawElements);
        return rawElements;
	}		
    private static native List<WebElement> selectElementsById(long underlyingDomNode, String using, List<WebElement> rawElements);
}