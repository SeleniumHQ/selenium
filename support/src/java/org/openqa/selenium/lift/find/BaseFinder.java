/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.lift.find;

import org.hamcrest.Description;
import org.hamcrest.Matcher;

import java.util.ArrayList;
import java.util.Collection;

/**
 * Base class for {@link Finder}s. These allow the creation of a specification
 * to be applied to objects of type T, to identify and return a Collection of
 * any contained objects of type S.
 *  
 * @author rchatley (Robert Chatley)
 */
public abstract class BaseFinder<S,T> implements Finder<S, T> {

	protected Matcher<S> matcher;
	
	public Collection<S> findFrom(T context) {
		
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
