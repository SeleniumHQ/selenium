/**
 * 
 */
package com.thoughtworks.webdriver.lift.find;

import java.util.Collection;

import org.hamcrest.Description;
import org.hamcrest.Matcher;

import com.thoughtworks.webdriver.By;
import com.thoughtworks.webdriver.WebDriver;
import com.thoughtworks.webdriver.WebElement;

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