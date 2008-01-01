package com.thoughtworks.webdriver.htmlunit;

import com.thoughtworks.webdriver.TestSuiteBuilder;

import junit.framework.Test;

public class HtmlUnitDriverTestSuite {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.addSourceDir("htmlunit")
					.usingDriver(HtmlUnitDriver.class)
					.exclude("htmlunit")
					.create();
	}
}
