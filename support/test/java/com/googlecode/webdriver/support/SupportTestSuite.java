package com.googlecode.webdriver.support;

import junit.framework.Test;

import com.googlecode.webdriver.TestSuiteBuilder;

public class SupportTestSuite {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("support")
					.usingNoDriver()
					.withoutEnvironment()
					.create();
	}
}
