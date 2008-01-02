/**
 * A {@link Finder} for anchor tags, "links".
 */
package com.thoughtworks.webdriver.lift.find;

import org.hamcrest.Factory;

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