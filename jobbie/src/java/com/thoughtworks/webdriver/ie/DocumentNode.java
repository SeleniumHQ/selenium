package com.thoughtworks.webdriver.ie;

public class DocumentNode implements HtmlNode {
    private long nodePointer;

    public DocumentNode(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    public DocumentNode getDocument() {
        return this;
    }

    public HtmlNode getParent() {
        throw new UnsupportedOperationException("getParent");
    }

    public native HtmlNode getFirstChild();

    public HtmlNode getNextSibling() {
        return null;
    }

    public AttributeNode getFirstAttribute() {
        throw new UnsupportedOperationException("getFirstAttribute");
    }

    public String getName() {
        throw new UnsupportedOperationException("getName");
    }

    protected void finalize() throws Throwable {
        deleteStoredObject();
    }

    private native void deleteStoredObject();
}
