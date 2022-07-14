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

package com.thoughtworks.selenium.webdriven;

import com.thoughtworks.selenium.SeleniumException;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;

import static org.junit.jupiter.api.Assertions.fail;

public class TimerTest {

  @Test
  public void testCannotExecuteCommandsAfterStoppingTheTimer() {
    Timer timer = new Timer(250);
    timer.stop();
    try {
      timer.run(new SeleneseCallable(5), null, new String[0]);
      fail();
    } catch (IllegalStateException ex) {
      // expected
    }
  }

  @Test
  public void testShouldTimeOut() {
    Timer timer = new Timer(10);
    try {
      timer.run(new SeleneseCallable(60), null, new String[0]);
    } catch (SeleniumException e) {
      timer.stop();
      return;
    }
    fail("Expecting timeout");
  }

  @Test
  public void testShouldNotTimeOut() {
    Timer timer = new Timer(200);
    timer.run(new SeleneseCallable(10), null, new String[0]);
    timer.stop();
  }


  class SeleneseCallable extends SeleneseCommand<Object> {
    final int waitFor;

    SeleneseCallable(int waitFor) {
      this.waitFor = waitFor;
    }

    @Override
    protected Object handleSeleneseCommand(WebDriver driver, String locator, String value) {
      try {
        Thread.sleep(waitFor);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
      return new Object();
    }
  }
}
