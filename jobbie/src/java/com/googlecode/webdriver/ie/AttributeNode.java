package com.googlecode.webdriver.ie;

public class AttributeNode implements HtmlNode {
    @SuppressWarnings("unused")
	private long nodePointer;

    public AttributeNode(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    public DocumentNode getDocument() {
        throw new UnsupportedOperationException("getDocument");
    }

    public native HtmlNode getParent();

    public native AttributeNode getFirstAttribute();

    public HtmlNode getFirstChild() {
        throw new UnsupportedOperationException("getFirstChild");
    }

    public native String getName();

    public native HtmlNode getNextSibling();

    public native String getText();

    protected void finalize() throws Throwable {
        deleteStoredObject();
    }

    private native void deleteStoredObject();
}
