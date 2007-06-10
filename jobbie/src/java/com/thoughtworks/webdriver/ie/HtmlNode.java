package com.thoughtworks.webdriver.ie;

interface HtmlNode {
	DocumentNode getDocument();

	HtmlNode getFirstChild();

	boolean hasNextSibling();
	
	HtmlNode getNextSibling();
		
	String getName();

	AttributeNode getFirstAttribute();
}
