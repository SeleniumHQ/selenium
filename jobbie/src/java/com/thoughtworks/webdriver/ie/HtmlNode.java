package com.thoughtworks.webdriver.ie;

class HtmlNode {
	private final long nodePointer;

	public HtmlNode(long nodePointer) {
		this.nodePointer = nodePointer;
	}
	
	public HtmlNode(Object contextNode) {
		nodePointer = ((HtmlNode) contextNode).nodePointer;
	}

	public native Object getDocument();

	public native boolean hasNextChild();

	public native Object getFirstChild();
	
	public native Object nextChild();
	
	public native Object getNextSibling();
	
	public native Object getPreviousSibling();
	
	public native Object getParent();
}
