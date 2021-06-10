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

@Ignore("getPrompt not implemented")
public class TestPrompt extends InternalSelenseTestBase {
  @Test
  public void testPrompt() throws Exception {
    selenium.open("test_prompt.html");
    verifyFalse(selenium.isPromptPresent());
    assertFalse(selenium.isPromptPresent());
    selenium.answerOnNextPrompt("no");
    selenium.click("promptAndLeave");
    verifyTrue(selenium.isPromptPresent());
    for (int second = 0;; second++) {
      if (second >= 60) fail("timeout");
      try {
        if (selenium.isPromptPresent()) break;
      } catch (Exception e) {
      }
      Thread.sleep(1000);
    }

    assertTrue(selenium.isPromptPresent());
    verifyEquals(selenium.getPrompt(), "Type 'yes' and click OK");
    verifyEquals(selenium.getTitle(), "Test Prompt");
    selenium.answerOnNextPrompt("yes");
    selenium.click("promptAndLeave");
    selenium.waitForPageToLoad("30000");
    verifyTrue(selenium.getPrompt().matches("^[\\s\\S]*'yes'[\\s\\S]*$"));
    verifyEquals(selenium.getTitle(), "Dummy Page");
  }
}
