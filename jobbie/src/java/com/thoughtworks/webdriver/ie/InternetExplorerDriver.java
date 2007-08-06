package com.thoughtworks.webdriver.ie;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

public class InternetExplorerDriver implements WebDriver {
	private List allWrappers = new ArrayList();
	private IeWrapper currentWrapper;
	
	public InternetExplorerDriver() {	
		currentWrapper = new IeWrapper();
		allWrappers.add(currentWrapper);
	}

	public WebDriver close() {
		currentWrapper.close();
		return findActiveWindow();
	}

	public WebDriver dumpBody() {
		currentWrapper.waitForLoadToComplete();
		currentWrapper.dumpBody();
		return findActiveWindow();
	}

	public WebDriver get(String url) {
		currentWrapper.get(url);
		return findActiveWindow();
	}

	public String getCurrentUrl() {
		currentWrapper.waitForLoadToComplete();
		return currentWrapper.getCurrentUrl();
	}

	public String getTitle() {
		currentWrapper.waitForLoadToComplete();
		return currentWrapper.getTitle();
	}

	public WebElement selectElement(String selector) {
		currentWrapper.waitForLoadToComplete();
		return currentWrapper.selectElement(selector);
	}

	public List selectElements(String selector) {
		currentWrapper.waitForLoadToComplete();
		return currentWrapper.selectElements(selector);
	}

	public String selectText(String xpath) {
		currentWrapper.waitForLoadToComplete();
		return currentWrapper.selectText(xpath);
	}

	public boolean getVisible() {
		return currentWrapper.getVisible();
	}
	
	public WebDriver setVisible(boolean visible) {
		Iterator iterator = allWrappers.iterator();
		while (iterator.hasNext()) {
			IeWrapper wrapper = (IeWrapper) iterator.next();
			wrapper.setVisible(visible);
		}
		return findActiveWindow();
	}

	public TargetLocator switchTo() {
		return currentWrapper.switchTo();
	}
	
	private WebDriver findActiveWindow() {
		throw new UnsupportedOperationException("findActiveWindow");
	}
}
