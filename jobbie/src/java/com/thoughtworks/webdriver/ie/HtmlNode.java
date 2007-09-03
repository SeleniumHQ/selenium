package com.thoughtworks.webdriver.ie;

interface HtmlNode {
    DocumentNode getDocument();

    HtmlNode getParent();

    HtmlNode getFirstChild();

    HtmlNode getNextSibling();

    String getName();

    AttributeNode getFirstAttribute();
}
