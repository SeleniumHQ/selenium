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

// Generated source.
package org.openqa.selenium.lift;

import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import org.hamcrest.Description;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.lift.find.BaseFinder;
import org.openqa.selenium.lift.find.Finder;

@Deprecated
public class Finders {

  public static org.openqa.selenium.lift.find.HtmlTagFinder div() {
    return org.openqa.selenium.lift.find.DivFinder.div();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder div(String id) {
    return org.openqa.selenium.lift.find.DivFinder.div(id);
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder link() {
    return org.openqa.selenium.lift.find.LinkFinder.link();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder link(java.lang.String anchorText) {
    return org.openqa.selenium.lift.find.LinkFinder.link(anchorText);
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder links() {
    return org.openqa.selenium.lift.find.LinkFinder.links();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder titles() {
    return org.openqa.selenium.lift.find.PageTitleFinder.titles();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder title() {
    return org.openqa.selenium.lift.find.PageTitleFinder.title();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder title(String title) {
    return org.openqa.selenium.lift.find.PageTitleFinder.title(title);
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder images() {
    return org.openqa.selenium.lift.find.ImageFinder.images();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder image() {
    return org.openqa.selenium.lift.find.ImageFinder.image();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder table() {
    return org.openqa.selenium.lift.find.TableFinder.table();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder tables() {
    return org.openqa.selenium.lift.find.TableFinder.tables();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder cell() {
    return org.openqa.selenium.lift.find.TableCellFinder.cell();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder cells() {
    return org.openqa.selenium.lift.find.TableCellFinder.cells();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder imageButton() {
    return org.openqa.selenium.lift.find.InputFinder.imageButton();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder imageButton(String label) {
    return org.openqa.selenium.lift.find.InputFinder.imageButton(label);
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder radioButton() {
    return org.openqa.selenium.lift.find.InputFinder.radioButton();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder radioButton(String id) {
    return org.openqa.selenium.lift.find.InputFinder.radioButton(id);
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder textbox() {
    return org.openqa.selenium.lift.find.InputFinder.textbox();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder button() {
    return org.openqa.selenium.lift.find.InputFinder.submitButton();
  }

  public static org.openqa.selenium.lift.find.HtmlTagFinder button(String label) {
    return org.openqa.selenium.lift.find.InputFinder.submitButton(label);
  }

  /**
   * A finder which returns the first element matched - such as if you have multiple elements which
   * match the finder (such as multiple links with the same text on a page etc)
   *
   * @param finder finder from which context to search
   * @return finder that will return the first match
   */
  public static Finder<WebElement, WebDriver> first(final Finder<WebElement, WebDriver> finder) {
    return new BaseFinder<WebElement, WebDriver>() {

      @Override
      public Collection<WebElement> findFrom(WebDriver context) {
        Collection<WebElement> collection = super.findFrom(context);
        if (!collection.isEmpty()) {
          Iterator<WebElement> iter = collection.iterator();
          return Collections.singletonList(iter.next());
        }
        return collection;
      }

      @Override
      protected Collection<WebElement> extractFrom(WebDriver context) {
        return finder.findFrom(context);
      }

      @Override
      protected void describeTargetTo(Description description) {
        description.appendText("first ");
        finder.describeTo(description);
      }
    };
  }
}
