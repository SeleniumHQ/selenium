package com.thoughtworks.selenium;

import org.openqa.selenium.server.RemoteControlConfiguration;
import org.openqa.selenium.server.SeleniumServer;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

public class TestSeleniumServerLauncher {
    SeleniumServer server;
    @BeforeSuite
    @Parameters({"selenium.host", "selenium.port"})
    public void startServer(@Optional("localhost") String host, @Optional("4444") int port) throws Exception {
        if (!"localhost".equals(host)) return;
        RemoteControlConfiguration config = new RemoteControlConfiguration();
        config.setPort(port);
        server = new SeleniumServer(config);
        server.start();
    }
    
    @AfterSuite(alwaysRun=true)
    public void stopServer() {
        if (server == null) return;
        server.stop();
    }
}
