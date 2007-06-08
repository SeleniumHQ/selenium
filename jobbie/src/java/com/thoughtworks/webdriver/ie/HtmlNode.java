package com.thoughtworks.webdriver.ie;

interface HtmlNode {
	Object getDocument();

	boolean hasNextChild();

	Object getFirstChild();
	
	Object nextChild();
	
	Object getNextSibling();
	
	Object getPreviousSibling();
	
	Object getParent();
	
	String getName();
}
