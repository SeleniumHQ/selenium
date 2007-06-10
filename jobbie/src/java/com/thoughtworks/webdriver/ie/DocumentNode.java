package com.thoughtworks.webdriver.ie;

public class DocumentNode implements HtmlNode {
	private long nodePointer;
	
	public DocumentNode(long nodePointer) {
		this.nodePointer = nodePointer;
	}
	
	public DocumentNode getDocument() {
		return this;
	}

	public native HtmlNode getFirstChild();
	
	public boolean hasNextSibling() {
		return false;
	}

	public HtmlNode getNextSibling() {
		return null;
	}
	
	public AttributeNode getFirstAttribute() {
		throw new UnsupportedOperationException("getFirstAttribute");
	}
	
	public String getName() {
		throw new UnsupportedOperationException("getName");
	}
}
