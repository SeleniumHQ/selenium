package com.thoughtworks.webdriver.ie;


public class ElementNode implements HtmlNode {
	private final long nodePointer;

	public ElementNode(long nodePointer) {
		this.nodePointer = nodePointer;
	}

	public native DocumentNode getDocument();

	public native HtmlNode getFirstChild();
	
	public native HtmlNode getNextSibling();

	public native AttributeNode getFirstAttribute();
	
	public String getName() {
		String name = getNativeName();
		return name == null ? null : name.toLowerCase();
	}
	
	private native String getNativeName();
}
