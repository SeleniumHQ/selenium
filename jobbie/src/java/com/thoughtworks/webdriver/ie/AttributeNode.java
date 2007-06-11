package com.thoughtworks.webdriver.ie;

public class AttributeNode implements HtmlNode {
	private long nodePointer;
	
	public AttributeNode(long nodePointer) {
		this.nodePointer = nodePointer;
	}
	
	public DocumentNode getDocument() {
		throw new UnsupportedOperationException("getDocument");
	}

	public native AttributeNode getFirstAttribute();

	public HtmlNode getFirstChild() {
		throw new UnsupportedOperationException("getFirstChild");
	}

	public native String getName();

	public native HtmlNode getNextSibling();

	public native boolean hasNextSibling();
	
	public native String getText();
}
