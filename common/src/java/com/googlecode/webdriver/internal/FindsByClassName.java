package com.googlecode.webdriver.internal;

import java.util.List;

import com.googlecode.webdriver.WebElement;

public interface FindsByClassName {
	WebElement findElementByClassName(String using);
	List<WebElement> findElementsByClassName(String using);
}
