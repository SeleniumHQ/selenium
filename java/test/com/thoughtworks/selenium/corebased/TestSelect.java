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

import org.junit.jupiter.api.Test;

public class TestSelect extends InternalSelenseTestBase {
  @Test
  public void testSelect() {
    selenium.open("test_select.html");
    assertTrue(selenium.isSomethingSelected("theSelect"));
    assertEquals(selenium.getSelectedLabel("theSelect"), "Second Option");
    selenium.select("theSelect", "index=4");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Fifth Option");
    verifyEquals(selenium.getSelectedIndex("theSelect"), "4");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Fifth Option");
    verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "Fifth Option");
    selenium.select("theSelect", "Third Option");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Third Option");
    selenium.select("theSelect", "label=Fourth Option");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Fourth Option");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Fourth Option");
    selenium.select("theSelect", "value=option6");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Sixth Option");
    verifyEquals(selenium.getSelectedValue("theSelect"), "option6");
    verifyEquals(selenium.getSelectedValue("theSelect"), "option6");
    selenium.select("theSelect", "value=");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Empty Value Option");
    selenium.select("theSelect", "id=o4");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "Fourth Option");
    verifyEquals(selenium.getSelectedId("theSelect"), "o4");
    selenium.select("theSelect", "");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "");
    verifyEquals(join(selenium.getSelectedLabels("theSelect"), ','), "");
    try {
      selenium.select("theSelect", "Not an option");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      selenium.addSelection("theSelect", "Fourth Option");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      selenium.removeSelection("theSelect", "Fourth Option");
      fail("expected failure");
    } catch (Throwable e) {
    }
    verifyEquals(
        join(selenium.getSelectOptions("theSelect"), ','),
        "First Option,Second Option,Third Option,Fourth Option,Fifth Option,Sixth Option,Empty Value Option,");
  }
}
