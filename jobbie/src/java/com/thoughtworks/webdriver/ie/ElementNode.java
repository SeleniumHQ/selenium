package com.thoughtworks.webdriver.ie;

import java.util.List;

import com.thoughtworks.webdriver.WebElement;

public class ElementNode implements HtmlNode, WebElement {
	private final long nodePointer;

	public ElementNode(long nodePointer) {
		this.nodePointer = nodePointer;
	}

	public native DocumentNode getDocument();

	public native HtmlNode getFirstChild();

	public native boolean hasNextSibling();
	
	public native HtmlNode getNextSibling();

	public native AttributeNode getFirstAttribute();
	
	public String getName() {
		String name = getNativeName();
		return name == null ? null : name.toLowerCase();
	}
	
	private native String getNativeName();

	public native void click();

	public String getAttribute(String name) {
		throw new UnsupportedOperationException("getAttribute");
	}

	public List getChildrenOfType(String tagName) {
		throw new UnsupportedOperationException("getChildrenOfType");
	}

	public native String getText();

	public String getValue() {
		throw new UnsupportedOperationException("getValue");
	}

	public boolean isEnabled() {
		throw new UnsupportedOperationException("isEnabled");
	}

	public boolean isSelected() {
		throw new UnsupportedOperationException("isSelected");
	}

	public void setSelected() {
		throw new UnsupportedOperationException("setSelected");
	}

	public void setValue(String value) {
		throw new UnsupportedOperationException("setValue");
	}

	public void submit() {
		throw new UnsupportedOperationException("submit");
	}

	public boolean toggle() {
		throw new UnsupportedOperationException("toggle");
	}
}
