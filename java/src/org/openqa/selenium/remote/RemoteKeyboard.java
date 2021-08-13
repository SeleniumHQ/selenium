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

package org.openqa.selenium.remote;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.interactions.Keyboard;

/**
 * An implementation of the keyboard for use with the remote webdriver.
 */
public class RemoteKeyboard implements Keyboard {
  protected final ExecuteMethod executor;

  public RemoteKeyboard(ExecuteMethod executor) {
    this.executor = executor;
  }

  @Override
  public void sendKeys(CharSequence... keysToSend) {
    if(keysToSend==null) {
      throw new IllegalArgumentException("Keys to send should be a not null CharSequence");
    }
    executor.execute(DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT,
        ImmutableMap.of("value", keysToSend));
  }

  @Override
  public void pressKey(CharSequence keyToPress) {
    // The wire protocol requires an array of keys.
    CharSequence[] sequence = {keyToPress};
    executor.execute(DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT,
                     ImmutableMap.of("value", sequence));
  }

  @Override
  public void releaseKey(CharSequence keyToRelease) {
    // The wire protocol requires an array of keys.
    CharSequence[] sequence = {keyToRelease};
    executor.execute(DriverCommand.SEND_KEYS_TO_ACTIVE_ELEMENT,
                     ImmutableMap.of("value", sequence));
  }

}
