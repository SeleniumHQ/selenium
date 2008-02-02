package com.googlecode.webdriver.lift.find;

/**
 * A {@link Finder} for HTML anchor tags, "links".
 * @author rchatley (Robert Chatley)
 *
 */
import static com.googlecode.webdriver.lift.match.TextMatcher.text;
import static org.hamcrest.Matchers.equalTo;

import org.hamcrest.Factory;

public class LinkFinder extends HtmlTagFinder {
	
	private LinkFinder() {};

	@Override
	protected String tagName() {
		return "a";
	}
	
	@Override
	protected String tagDescription() {
		return "link";
	}
	
	@Factory
	public static HtmlTagFinder link() {
		return new LinkFinder();
	}
	
	@Factory
	public static HtmlTagFinder link(String linkText) {
		return new LinkFinder().with(text(equalTo(linkText)));
	}
	
	@Factory
	public static HtmlTagFinder links() {
		return link();
	}
}