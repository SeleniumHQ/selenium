package com.googlecode.webdriver.lift.find;

import java.util.Collection;

import org.hamcrest.Description;
import org.hamcrest.Matcher;

import com.googlecode.webdriver.By;
import com.googlecode.webdriver.WebDriver;
import com.googlecode.webdriver.WebElement;

/**
 * Base {@link Finder} for all types of HTML tags. Subclasses should be created
 * for each specific tag, specifying the tag name (e.g. "a" in the case or an anchor
 * tag), and a description.
 *  
 * @author rchatley (Robert Chatley)
 */
public abstract class HtmlTagFinder extends BaseFinder<WebElement, WebDriver> {
	
	@SuppressWarnings("unchecked")
	protected Collection<WebElement> extractFrom(WebDriver context) {
		return context.findElements(By.xpath("//" + tagName()));
	}
	
	protected void describeTargetTo(Description description) {
		description.appendText(tagDescription());
	}
	
	@Override // more specific return type
	public HtmlTagFinder with(Matcher<WebElement> matcher) {
		this.matcher = matcher;
		return this;
	}
	
	protected abstract String tagName();

	protected abstract String tagDescription();
}