package com.googlecode.webdriver.ie;


public class ElementNode extends AbstractNode {
    public ElementNode(long nodePointer) {
        super(nodePointer);
    }

    public native AttributeNode getFirstAttribute();
    
    @Override
    public String toString() {
    	return String.format("%s", getName());
    }
}
