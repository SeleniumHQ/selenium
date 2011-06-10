package org.openqa.grid;

import org.junit.Assert;
import org.openqa.grid.web.Hub;
import org.testng.annotations.Test;

public class HubTest {
    @Test
    public void loadGrid1Config() {
        // The values in the config file are in seconds, but we use milliseconds internally, so make sure they get converted.
        Assert.assertEquals(180000, Hub.getGrid1Config().get("timeout").intValue());
        Assert.assertEquals(60000, Hub.getGrid1Config().get("cleanupCycle").intValue());
    }

    @Test
    public void loadGrid1Mapping() {
        Assert.assertEquals("*firefox", Hub.getGrid1Mapping().get("Firefox 4; MacOS X: 10.6.7"));
        Assert.assertEquals("*iexplorecustom", Hub.getGrid1Mapping().get("windows_internet_explorer_8"));
        Assert.assertEquals("*firefox /opt/firefox/firefox-3.6/firefox-bin", Hub.getGrid1Mapping().get("linux_firefox_3_6"));
    }
}
