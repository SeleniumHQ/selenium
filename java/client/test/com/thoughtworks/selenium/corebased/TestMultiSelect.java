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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Test;

public class TestMultiSelect extends InternalSelenseTestBase {
  @Test
  public void testMultiSelect() {
    selenium.open("../tests/html/test_multiselect.html");
    assertEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Second Option");
    selenium.select("theSelect", "index=4");
    verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Fifth Option");
    selenium.addSelection("theSelect", "Third Option");
    selenium.addSelection("theSelect", "value=");
    verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','),
        "Third Option,Fifth Option,Empty Value Option");
    selenium.removeSelection("theSelect", "id=o7");
    verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Third Option,Fifth Option");
    selenium.removeSelection("theSelect", "label=Fifth Option");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");
    selenium.addSelection("theSelect", "");
    verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Third Option,");
    selenium.removeSelection("theSelect", "");
    selenium.removeSelection("theSelect", "Third Option");
    try {
      assertEquals(selenium.getSelectedLabel("theSelect"), "");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(join(selenium.getSelectedLabels("theSelect"), ','), "");
      fail("expected failure");
    } catch (Throwable e) {
    }
    verifyEquals(selenium.getValue("theSelect"), "");
    verifyFalse(selenium.isSomethingSelected("theSelect"));
    selenium.addSelection("theSelect", "Third Option");
    selenium.addSelection("theSelect", "value=");
    selenium.removeAllSelections("theSelect");
    verifyFalse(selenium.isSomethingSelected("theSelect"));
  }
}
