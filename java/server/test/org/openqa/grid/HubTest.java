package org.openqa.grid;

import org.junit.Assert;
import org.openqa.grid.web.Hub;
import org.testng.annotations.Test;

import java.net.URL;
import java.net.URLClassLoader;

/**
 * Created by IntelliJ IDEA.
 * User: nirvdrum
 * Date: 6/10/11
 * Time: 3:55 PM
 * To change this template use File | Settings | File Templates.
 */
public class HubTest {
    @Test
    public void loadGrid1Config() {
        // The values in the config file are in seconds, but we use milliseconds internally, so make sure they get converted.
        Assert.assertEquals(180000, Hub.getGrid1Config().get("timeout").intValue());
        Assert.assertEquals(60000, Hub.getGrid1Config().get("cleanupCycle").intValue());
    }

    @Test
    public void loadGrid1Mapping() {
        //Get the System Classloader
        ClassLoader sysClassLoader = Hub.class.getClassLoader();

        //Get the URLs
        URL[] urls = ((URLClassLoader)sysClassLoader).getURLs();

        for(int i=0; i< urls.length; i++)
        {
            System.out.println(urls[i].getFile());
        }   

        Assert.assertEquals("*firefox", Hub.getGrid1Mapping().get("Firefox 4; MacOS X: 10.6.7"));
        Assert.assertEquals("*iexplorecustom", Hub.getGrid1Mapping().get("windows_internet_explorer_8"));
        Assert.assertEquals("*firefox /opt/firefox/firefox-3.6/firefox-bin", Hub.getGrid1Mapping().get("linux_firefox_3_6"));
    }
}
