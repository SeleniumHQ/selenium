package com.thoughtworks.webdriver.support;

import junit.framework.Test;

import com.thoughtworks.webdriver.TestSuiteBuilder;

public class SupportTestSuite {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("support")
					.usingNoDriver()
					.withoutEnvironment()
					.create();
	}
}
