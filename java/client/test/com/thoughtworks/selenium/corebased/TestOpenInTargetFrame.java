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

public class TestOpenInTargetFrame extends InternalSelenseTestBase {
  @Test
  public void testOpenInTargetFrame() throws Exception {
    selenium.open("../tests/html/test_open_in_target_frame.html");
    selenium.selectFrame("rightFrame");
    selenium.click("link=Show new frame in leftFrame");
    // we are forced to do a pause instead of clickandwait here,
    // for currently we can not detect target frame loading in ie yet
    Thread.sleep(1500);
    verifyTrue(selenium.isTextPresent("Show new frame in leftFrame"));
    selenium.selectFrame("relative=top");
    selenium.selectFrame("leftFrame");
    verifyTrue(selenium.isTextPresent("content loaded"));
    verifyFalse(selenium.isTextPresent("This is frame LEFT"));
  }
}
