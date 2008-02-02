package com.googlecode.webdriver.lift.find;

import org.hamcrest.Factory;

/**
 * A {@link Finder} for HTML table cell "td" tags.
 * @author rchatley (Robert Chatley)
 *
 */
public class TableCellFinder extends HtmlTagFinder {
	
	private TableCellFinder() {};

	@Override
	protected String tagName() {
		return "td";
	}
	
	@Override
	protected String tagDescription() {
		return "table cell";
	}
	
	@Factory
	public static HtmlTagFinder cell() {
		return new TableCellFinder();
	}
	
	@Factory
	public static HtmlTagFinder cells() {
		return cell();
	}
}