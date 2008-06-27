package org.openqa.selenium.lift.find;

import static org.openqa.selenium.lift.Matchers.attribute;
import static org.hamcrest.Matchers.equalTo;

import org.hamcrest.Factory;

/**
 * {@link Finder} for HTML input tags.
 * @author rchatley (Robert Chatley)
 *
 */
public class InputFinder extends HtmlTagFinder {

	@Override
	protected String tagDescription() {
		return "input field";
	}

	@Override
	protected String tagName() {
		return "input";
	}

	@Factory
	public static HtmlTagFinder textbox() {
		return new InputFinder().with(attribute("type", equalTo("text")));
	}

	@Factory
	public static HtmlTagFinder submitButton() {
		return new InputFinder().with(attribute("type", equalTo("submit")));
	}

	@Factory
	public static HtmlTagFinder submitButton(String label) {
		return submitButton().with(attribute("value", equalTo(label)));
	}
}
