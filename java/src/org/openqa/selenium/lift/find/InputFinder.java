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

import static org.hamcrest.Matchers.equalTo;
import static org.openqa.selenium.lift.Matchers.attribute;
import static org.openqa.selenium.lift.Matchers.value;

/** {@link Finder} for HTML input tags. */
@Deprecated
public class InputFinder extends HtmlTagFinder {

  @Override
  protected String tagDescription() {
    return "input field";
  }

  @Override
  protected String tagName() {
    return "input";
  }

  public static HtmlTagFinder textbox() {
    return new InputFinder().with(attribute("type", equalTo("text")));
  }

  public static HtmlTagFinder imageButton() {
    return new InputFinder().with(attribute("type", equalTo("image")));
  }

  public static HtmlTagFinder imageButton(String label) {
    return imageButton().with(value((label)));
  }

  public static HtmlTagFinder radioButton() {
    return new InputFinder().with(attribute("type", equalTo("radio")));
  }

  public static HtmlTagFinder radioButton(String id) {
    return radioButton().with(attribute("id", equalTo(id)));
  }

  public static HtmlTagFinder submitButton() {
    return new InputFinder().with(attribute("type", equalTo("submit")));
  }

  public static HtmlTagFinder submitButton(String label) {
    return submitButton().with(value(label));
  }
}
