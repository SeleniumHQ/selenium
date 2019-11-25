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

package org.openqa.selenium.server.htmlrunner;


import com.thoughtworks.selenium.Selenium;

abstract class NextStepDecorator {

  static NextStepDecorator IDENTITY = new NextStepDecorator(null) {

    @Override
    public boolean isOkayToContinueTest() {
      return true;
    }
  };

  private final Throwable cause;

  public NextStepDecorator() {
    this(null);
  }

  public NextStepDecorator(Throwable cause) {
    this.cause = cause;
  }

  public abstract boolean isOkayToContinueTest();

  public NextStepDecorator evaluate(CoreStep nextStep, Selenium selenium, TestState state) {
    return nextStep.execute(selenium, state);
  }

  public Throwable getCause() {
    return cause;
  }

  public static NextStepDecorator ERROR(Throwable cause) {
    return new NextStepDecorator(cause) {
      @Override
      public boolean isOkayToContinueTest() {
        return false;
      }
    };
  }

  public static NextStepDecorator ASSERTION_FAILED(String message) {
    return new NextStepDecorator(new AssertionError(message)) {
      @Override
      public boolean isOkayToContinueTest() {
        return false;
      }
    };
  }

  public static NextStepDecorator VERIFICATION_FAILED(String message) {
    return new NextStepDecorator(new AssertionError(message)) {
      @Override
      public boolean isOkayToContinueTest() {
        return true;
      }
    };
  }


}
