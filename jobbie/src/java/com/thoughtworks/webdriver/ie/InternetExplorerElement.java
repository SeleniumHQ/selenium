package com.thoughtworks.webdriver.ie;

import java.util.List;

import com.thoughtworks.webdriver.WebElement;

public class InternetExplorerElement implements WebElement {
	private final long nodePointer;

	private InternetExplorerElement(long nodePointer) {
		this.nodePointer = nodePointer;
	}

	public native void foo(long foo);
	
	public native void click();

	public native String getAttribute(String name);

	public List getChildrenOfType(String tagName) {
		return null;
	}

	public native String getText();

	public native String getValue();

	public native void setValue(String value);
	
	public native boolean isEnabled();

	public native boolean isSelected();

	public native void setSelected();

	public native void submit();

	public native boolean toggle();
}
