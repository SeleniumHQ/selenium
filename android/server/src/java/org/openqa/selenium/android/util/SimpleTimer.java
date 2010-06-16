/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.android.util;

/**
 * Simple timer class used to time actions executed.
 */
public class SimpleTimer {
  private long start;
  private long end;
  private boolean isRunning;
  
  public SimpleTimer() {
    start = 0L;
    end = 0L;
    isRunning = false;
  }
  
  public void start() {
    start = System.currentTimeMillis();
    isRunning = true;
  }
  
  public void stop() {
    end = System.currentTimeMillis();
    isRunning = false;
  }
  
  public long getInMillis() {
    return (end - start);
  }
  
  public boolean isRunning() {
    return isRunning;
  }
}
