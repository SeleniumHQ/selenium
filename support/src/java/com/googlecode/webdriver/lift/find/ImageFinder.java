package com.googlecode.webdriver.lift.find;

import org.hamcrest.Factory;

public class ImageFinder extends HtmlTagFinder {

	@Override
	protected String tagDescription() {
		return "image";
	}

	@Override
	protected String tagName() {
		return "img";
	}

	@Factory
	public static HtmlTagFinder image() {
		return new ImageFinder();
	}
	
	@Factory
	public static HtmlTagFinder images() {
		return new ImageFinder();
	}
}
