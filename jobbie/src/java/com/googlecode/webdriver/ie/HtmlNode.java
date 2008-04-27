package com.googlecode.webdriver.ie;

interface HtmlNode {
    DocumentNode getDocument();

    HtmlNode getParent();

    HtmlNode getFirstChild();

    HtmlNode getNextSibling();

    String getName();

    String getText();
    
    AttributeNode getFirstAttribute();
}
