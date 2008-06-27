package org.openqa.selenium.lift.find;

import java.util.Collection;

import org.hamcrest.Description;
import org.hamcrest.Matcher;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Base {@link Finder} for all types of HTML tags. Subclasses should be created
 * for each specific tag, specifying the tag name (e.g. "a" in the case or an anchor
 * tag), and a description.
 *  
 * @author rchatley (Robert Chatley)
 */
public abstract class HtmlTagFinder extends BaseFinder<WebElement, WebDriver> {
	
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