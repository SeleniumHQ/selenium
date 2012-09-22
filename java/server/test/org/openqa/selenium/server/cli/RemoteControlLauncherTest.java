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


package org.openqa.selenium.server.cli;

import org.junit.Test;
import org.openqa.selenium.server.RemoteControlConfiguration;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * {@link org.openqa.selenium.server.cli.RemoteControlLauncher} unit test class.
 */
public class RemoteControlLauncherTest {

  @Test
  public void testHonorSystemProxyIsSetWhenProvidedAsAnOption() {
    final RemoteControlConfiguration configuration;

    configuration =
        RemoteControlLauncher.parseLauncherOptions(new String[] {"-honor-system-proxy"});
    assertTrue(configuration.honorSystemProxy());
  }

  @Test
  public void testHonorSystemProxyIsFalseWhenNotProvidedAsAnOption() {
    final RemoteControlConfiguration configuration;

    configuration = RemoteControlLauncher.parseLauncherOptions(new String[] {});
    assertFalse(configuration.honorSystemProxy());
  }

}
