package com.googlecode.webdriver.lift.find;

import java.util.ArrayList;
import java.util.Collection;

import org.hamcrest.Description;
import org.hamcrest.Matcher;

public abstract class BaseFinder<S,T> implements Finder<S, T> {

	protected Matcher<S> matcher;
	
	public Collection<S> findFrom(T context, Matcher<Integer> cardinalityConstraint) {
		
		Collection<S> found = extractFrom(context);		
		
		if (matcher == null) {
			return found;
		} else {
			return allMatching(matcher, found);
		}
	}
	
	public Finder<S, T> with(Matcher<S> matcher) {
		this.matcher = matcher;
		return this;
	}
	
	public void describeTo(Description description) {
		describeTargetTo(description);
		if (matcher != null) {
			description.appendText(" with ");
			matcher.describeTo(description);
		}
	}
	
	protected abstract Collection<S> extractFrom(T context);
	
	protected abstract void describeTargetTo(Description description);

	protected Collection<S> allMatching(Matcher<?> matcher, Collection<S> items) {
		Collection<S> temp = new ArrayList<S>();
		for (S item : items) {
			if (matcher.matches(item)) {
				temp.add(item);
			}
		}
		return temp;
	}
}
