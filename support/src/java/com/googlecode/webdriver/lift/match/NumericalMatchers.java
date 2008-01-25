package com.googlecode.webdriver.lift.match;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.greaterThan;

import org.hamcrest.Factory;
import org.hamcrest.Matcher;

public class NumericalMatchers {

	@Factory
	public static Matcher<Integer> atLeast(int i) {
		return greaterThan(i - 1);
	}

	@Factory
	public static Matcher<Integer> exactly(int i) {
		return equalTo(i);
	}
}
