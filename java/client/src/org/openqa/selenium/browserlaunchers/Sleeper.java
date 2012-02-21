/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package org.openqa.selenium.browserlaunchers;

/**
 * Primitives for sleeping
 */
public class Sleeper {

  /**
   * Sleeps without explicitly throwing an InterruptedException
   *
   * @param timeoutInSeconds Sleep time in seconds.
   * @throws RuntimeException wrapping an InterruptedException if one gets thrown
   */
  public static void sleepTightInSeconds(long timeoutInSeconds) {
    sleepTight(timeoutInSeconds * 1000);
  }

  /**
   * Sleeps without explicitly throwing an InterruptedException
   *
   * @param timeout the amout of time to sleep
   * @throws RuntimeException wrapping an InterruptedException if one gets thrown
   */
  public static void sleepTight(long timeout) {
    try {
      Thread.sleep(timeout);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
  }
}
