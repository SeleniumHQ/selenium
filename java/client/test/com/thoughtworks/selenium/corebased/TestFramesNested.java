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

import org.junit.Ignore;
import org.junit.Test;

@Ignore
public class TestFramesNested extends InternalSelenseTestBase {
  @Test
  public void testFramesNested() {
    selenium.open("NestedFrames.html");
    verifyEquals(selenium.getTitle(), "NestedFrames");
    verifyFalse(selenium.isTextPresent("This is a test"));
    selenium.selectFrame("mainFrame");
    verifyEquals(selenium.getTitle(), "NestedFrames2");
    selenium.selectFrame("mainFrame");
    verifyEquals(selenium.getTitle(), "AUT");
    selenium.selectFrame("mainFrame");
    verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/common/legacy/test_open\\.html$"));
    verifyTrue(selenium.isTextPresent("This is a test"));
    selenium.selectFrame("relative=up");
    verifyEquals(selenium.getTitle(), "AUT");
    verifyFalse(selenium.isTextPresent("This is a test"));
    selenium.selectFrame("relative=top");
    verifyEquals(selenium.getTitle(), "NestedFrames");
    selenium.selectFrame("dom=window.frames[1]");
    verifyEquals(selenium.getTitle(), "NestedFrames2");
    selenium.selectFrame("relative=top");
    verifyEquals(selenium.getTitle(), "NestedFrames");
    selenium.selectFrame("index=1");
    verifyEquals(selenium.getTitle(), "NestedFrames2");
    selenium.selectFrame("relative=top");
    verifyEquals(selenium.getTitle(), "NestedFrames");
    selenium.selectFrame("foo");
    verifyEquals(selenium.getTitle(), "NestedFrames2");
    selenium.selectFrame("relative=top");
    verifyEquals(selenium.getTitle(), "NestedFrames");
    selenium.selectFrame("dom=window.frames[\"mainFrame\"].frames[\"mainFrame\"]");
    verifyEquals(selenium.getTitle(), "AUT");
  }
}
