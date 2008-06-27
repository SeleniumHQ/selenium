/**
 * A {@link Finder} for title tags.
 */
package org.openqa.selenium.lift.find;

import static org.openqa.selenium.lift.match.TextMatcher.text;
import static org.hamcrest.Matchers.equalTo;

import org.hamcrest.Factory;

/**
 * A {@link Finder} for HTML title tags.
 * @author rchatley (Robert Chatley)
 *
 */
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
	public static HtmlTagFinder title(String title) {
		return new PageTitleFinder().with(text(equalTo(title)));
	}
	
	@Factory
	public static HtmlTagFinder titles() {
		return new PageTitleFinder();
	}
}