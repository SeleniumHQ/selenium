package org.openqa.selenium.internal;

import java.util.List;

import org.openqa.selenium.WebElement;

public interface FindsByClassName {
	WebElement findElementByClassName(String using);
	List<WebElement> findElementsByClassName(String using);
}
