package org.openqa.selenium;

import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

public class TestSeleniumServerLauncher {
    SeleniumServer server;
    @BeforeSuite
    @Parameters({"selenium.host", "selenium.port"})
    public void startServer(@Optional("localhost") String host, @Optional("4444") String port) throws Exception {
        if (!"localhost".equals(host)) return;
        RemoteControlConfiguration config = new RemoteControlConfiguration();
        config.setPort(Integer.parseInt(port));
        server = new SeleniumServer(config);
        server.start();
    }
    
    @AfterSuite(alwaysRun=true)
    public void stopServer() {
        if (server == null) return;
        server.stop();
    }
}
