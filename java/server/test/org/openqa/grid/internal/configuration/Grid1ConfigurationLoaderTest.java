/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.internal.configuration;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.grid.internal.utils.GridHubConfiguration;


public class Grid1ConfigurationLoaderTest {

  /**
   * check that the example from grid1 1.0.8 can be parsed properly.
   */
  @Test
  public void loadGrid1Config() {
    GridHubConfiguration config = new GridHubConfiguration();
    config.loadFromGridYml("grid_configuration_test1.yml");

    // The values in the config file are in seconds, but we use milliseconds
    // internally, so make sure they get converted.

    Assert.assertEquals(4444, config.getPort());
    Assert.assertEquals(180000, config.getAllParams().get("nodePolling"));
    Assert.assertEquals(300000, config.getTimeout());
    Assert.assertEquals(180000, config.getCleanupCycle());
    Assert.assertEquals("*firefox", config.getGrid1Mapping().get("Firefox on OS X"));

  }

  @Test
  public void loadCustomMapping() {
    GridHubConfiguration config = new GridHubConfiguration();
    config.loadFromGridYml("grid_configuration_test2.yml");

    Assert.assertEquals("*firefox", config.getGrid1Mapping().get("Firefox 4; MacOS X: 10.6.7"));
    Assert.assertEquals("*iexplorecustom",
        config.getGrid1Mapping().get("windows_internet_explorer_8"));
    Assert.assertEquals("*firefox /opt/firefox/firefox-3.6/firefox-bin", config.getGrid1Mapping()
        .get("linux_firefox_3_6"));
  }
}
