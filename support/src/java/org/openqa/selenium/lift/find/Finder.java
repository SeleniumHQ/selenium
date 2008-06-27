/**
 * 
 */
package org.openqa.selenium.lift.find;

import java.util.Collection;

import org.hamcrest.Matcher;
import org.hamcrest.SelfDescribing;
/**
 * @author rchatley (Robert Chatley)
 */
public interface Finder<S,T> extends SelfDescribing {
	Collection<S> findFrom(T context);
	Finder<S, T> with(Matcher<S> textMatcher);
}