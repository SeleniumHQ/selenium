// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.lift.find;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Base class for {@link Finder}s. These allow the creation of a specification to be applied to
 * objects of type T, to identify and return a Collection of any contained objects of type S.
 */
public abstract class BaseFinder<S, T> implements Finder<S, T> {

  protected List<Matcher<S>> matchers = new ArrayList<>();

  @Override
  public Collection<S> findFrom(T context) {

    Collection<S> found = extractFrom(context);

    if (matchers.isEmpty()) {
      return found;
    }
    return allMatching(matchers, found);
  }

  @Override
  public Finder<S, T> with(Matcher<S> matcher) {
    this.matchers.add(matcher);
    return this;
  }

  @Override
  public void describeTo(Description description) {
    describeTargetTo(description);
    for (Matcher<?> matcher : matchers) {
      if (matcher != null) {
        description.appendText(" with ");
        matcher.describeTo(description);
      }
    }
  }

  protected abstract Collection<S> extractFrom(T context);

  protected abstract void describeTargetTo(Description description);

  protected Collection<S> allMatching(List<Matcher<S>> matchers, Collection<S> items) {
    Collection<S> temp = new ArrayList<>();
    for (S item : items) {
      if (allOf(matchers).matches(item)) {
        temp.add(item);
      }
    }
    return temp;
  }

  private Matcher<S> allOf(final List<Matcher<S>> matcherList) {
    return new TypeSafeMatcher<S>() {
      @Override
      public boolean matchesSafely(S item) {
        for (Matcher<S> matcher : matcherList) {
          if (!matcher.matches(item)) {
            return false;
          }
        }
        return true;
      }

      @Override
      public void describeTo(Description description) {
        for (Matcher<S> matcher : matcherList) {
          matcher.describeTo(description);
        }
      }
    };
  }
}
