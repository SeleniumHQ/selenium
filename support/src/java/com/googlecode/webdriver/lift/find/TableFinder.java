package com.googlecode.webdriver.lift.find;

import org.hamcrest.Factory;

/**
 * A {@link Finder} for HTML table tags.
 * @author rchatley (Robert Chatley)
 *
 */
public class TableFinder extends HtmlTagFinder {
	
	private TableFinder() {};

	@Override
	protected String tagName() {
		return "table";
	}
	
	@Override
	protected String tagDescription() {
		return "table";
	}
	
	@Factory
	public static HtmlTagFinder table() {
		return new TableFinder();
	}
	
	@Factory
	public static HtmlTagFinder tables() {
		return table();
	}
}