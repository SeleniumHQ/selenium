package com.googlecode.webdriver.htmlunit;

import com.googlecode.webdriver.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class HtmlUnitDriverTestSuite extends TestCase {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.addSourceDir("htmlunit")
					.usingDriver(HtmlUnitDriver.class)
					.exclude("htmlunit")
					.create();
	}
}
