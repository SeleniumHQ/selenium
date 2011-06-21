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
		GridHubConfiguration config = GridHubConfiguration.loadFromGridYml("grid_configuration_test1.yml");
		// The values in the config file are in seconds, but we use milliseconds
		// internally, so make sure they get converted.

		Assert.assertEquals(4444, config.getPort());
		Assert.assertEquals(180000, config.getNodePolling());
		Assert.assertEquals(300000, config.getTimeout());
		Assert.assertEquals(180000, config.getCleanupCycle());
		Assert.assertEquals("*firefox", config.getGrid1Mapping().get("Firefox on OS X"));

	}

	@Test
	public void loadCustomMapping() {
		GridHubConfiguration config = GridHubConfiguration.loadFromGridYml("grid_configuration_test2.yml");
		
		Assert.assertEquals("*firefox",config.getGrid1Mapping().get("Firefox 4; MacOS X: 10.6.7"));
		Assert.assertEquals("*iexplorecustom", config.getGrid1Mapping().get("windows_internet_explorer_8"));
		Assert.assertEquals("*firefox /opt/firefox/firefox-3.6/firefox-bin", config.getGrid1Mapping().get("linux_firefox_3_6"));
	}
}
