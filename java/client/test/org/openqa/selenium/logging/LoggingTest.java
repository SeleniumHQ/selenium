/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.logging;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import java.util.logging.Level;

public class LoggingTest {

  @Test
  public void testLogLevelConversions() {
    assertEquals(Level.ALL, LogLevelMapping.toLevel("ALL"));
    assertEquals(Level.FINE, LogLevelMapping.toLevel("DEBUG"));
    assertEquals(Level.INFO, LogLevelMapping.toLevel("INFO"));
    assertEquals(Level.WARNING, LogLevelMapping.toLevel("WARNING"));
    assertEquals(Level.SEVERE, LogLevelMapping.toLevel("SEVERE"));
    assertEquals(Level.OFF, LogLevelMapping.toLevel("OFF"));
  }
}