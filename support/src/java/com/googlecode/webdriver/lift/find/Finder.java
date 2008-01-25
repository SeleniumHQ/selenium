/**
 * 
 */
package com.googlecode.webdriver.lift.find;

import java.util.Collection;

import org.hamcrest.Matcher;
import org.hamcrest.SelfDescribing;

public interface Finder<S,T> extends SelfDescribing {
	Collection<S> findFrom(T context, Matcher<Integer> cardinalityConstraint);
	Finder<S, T> with(Matcher<S> textMatcher);
}