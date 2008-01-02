/**
 * A {@link Finder} for title tags.
 */
package com.thoughtworks.webdriver.lift.find;

import org.hamcrest.Factory;


public class PageTitleFinder extends HtmlTagFinder {
	
	private PageTitleFinder() {};

	@Override
	protected String tagName() {
		return "title";
	}

	@Override
	protected String tagDescription() {
		return "page title";
	}

	@Factory
	public static HtmlTagFinder title() {
		return new PageTitleFinder();
	}
	
	@Factory
	public static HtmlTagFinder titles() {
		return new PageTitleFinder();
	}
}