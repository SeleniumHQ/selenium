package com.thoughtworks.webdriver.ie;

public class ElementNode implements HtmlNode {
	private final long nodePointer;

	public ElementNode(long nodePointer) {
		this.nodePointer = nodePointer;
	}

	public native Object getDocument();

	public native Object getFirstChild();

	public native Object nextChild();
	
	public native boolean hasNextChild();

	public Object getNextSibling() {
		throw new UnsupportedOperationException("getNextSibling");
	}

	public Object getParent() {
		throw new UnsupportedOperationException("getParent");
	}

	public Object getPreviousSibling() {
		throw new UnsupportedOperationException("getPreviousSibling");
	}

	public native String getName();
}
