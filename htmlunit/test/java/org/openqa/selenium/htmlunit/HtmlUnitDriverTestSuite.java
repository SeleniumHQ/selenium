package org.openqa.selenium.htmlunit;

import org.openqa.selenium.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class HtmlUnitDriverTestSuite extends TestCase {
	public static Test suite() throws Exception {
		return new TestSuiteBuilder()
					.addSourceDir("common")
					.addSourceDir("htmlunit")
					.usingDriver(HtmlUnitDriver.class)
					.exclude("htmlunit")
					.create();
	}
}
