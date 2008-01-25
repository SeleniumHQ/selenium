package com.googlecode.webdriver.ie;

public class TextNode extends AbstractNode {
    public TextNode(long nodePointer) {
        super(nodePointer);
    }

    public native AttributeNode getFirstAttribute();
}
