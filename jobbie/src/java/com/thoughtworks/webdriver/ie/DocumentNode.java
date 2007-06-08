package com.thoughtworks.webdriver.ie;

public class DocumentNode implements HtmlNode {
	private long nodePointer;
	
	public DocumentNode(long nodePointer) {
		this.nodePointer = nodePointer;
	}
	
	public Object getDocument() {
		return this;
	}

	public native boolean hasNextChild();

	public native Object nextChild();

	public Object getFirstChild() {
		throw new UnsupportedOperationException("getFirstChild");
	}

	public Object getNextSibling() {
		throw new UnsupportedOperationException("getNextSibling");
	}

	public Object getParent() {
		throw new UnsupportedOperationException("getParent");
	}

	public Object getPreviousSibling() {
		throw new UnsupportedOperationException("getPreviousSibling");
	}
	
	public String getName() {
		throw new UnsupportedOperationException("getName");
	}
}
