package com.googlecode.webdriver.support;

import com.googlecode.webdriver.TestSuiteBuilder;

import junit.framework.Test;
import junit.framework.TestCase;

public class SupportTestSuite extends TestCase {
	public static Test suite() {
		return new TestSuiteBuilder()
					.addSourceDir("support")
					.usingNoDriver()
					.withoutEnvironment()
					.create();
	}
}
