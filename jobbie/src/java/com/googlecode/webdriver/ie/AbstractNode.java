package com.googlecode.webdriver.ie;

public abstract class AbstractNode implements HtmlNode {
    @SuppressWarnings("unused")
    private final long nodePointer;

    public AbstractNode(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    public native DocumentNode getDocument();

    public native HtmlNode getParent();

    public native HtmlNode getFirstChild();

    public native HtmlNode getNextSibling();

    public native String getText();
    
    public abstract AttributeNode getFirstAttribute();

    public String getName() {
        String name = getNativeName();
        return name == null ? null : name.toLowerCase();
    }

    private native String getNativeName();

    protected void finalize() throws Throwable {
        deleteStoredObject();
    }

    private native void deleteStoredObject();
}
