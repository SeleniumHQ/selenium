package com.thoughtworks.webdriver.ie;


public class ElementNode implements HtmlNode {
    @SuppressWarnings("unused")
    private final long nodePointer;

    public ElementNode(long nodePointer) {
        this.nodePointer = nodePointer;
    }

    public native DocumentNode getDocument();

    public native HtmlNode getParent();

    public native HtmlNode getFirstChild();

    public native HtmlNode getNextSibling();

    public native AttributeNode getFirstAttribute();

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
