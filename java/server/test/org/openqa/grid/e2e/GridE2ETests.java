package org.openqa.grid.e2e;

/**
 * Created with IntelliJ IDEA. User: alexei Date: 05.05.13 Time: 15:29 To change this template use
 * File | Settings | File Templates.
 */

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.grid.e2e.misc.ConfigInheritanceTest;
import org.openqa.grid.e2e.misc.Grid1HeartbeatTest;
import org.openqa.grid.e2e.misc.GridSerializeExceptionTest;
import org.openqa.grid.e2e.misc.HubRestart;
import org.openqa.grid.e2e.misc.HubRestartNeg;
import org.openqa.grid.e2e.misc.WebDriverPriorityDemo;
import org.openqa.grid.e2e.node.BrowserTimeOutTest;
import org.openqa.grid.e2e.node.CrashWhenStartingBrowserTest;
import org.openqa.grid.e2e.node.DefaultProxyFindsFirefoxLocationsTest;
import org.openqa.grid.e2e.node.DefaultProxyIsUnregisteredIfDownForTooLongTest;
import org.openqa.grid.e2e.node.NodeGoingDownAndUpTest;
import org.openqa.grid.e2e.node.NodeRecoveryTest;
import org.openqa.grid.e2e.node.NodeTimeOutTest;
import org.openqa.grid.e2e.node.SmokeTest;
import org.openqa.grid.e2e.utils.ExtraServletUtilTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    ConfigInheritanceTest.class,
    Grid1HeartbeatTest.class,
    GridSerializeExceptionTest.class,
    HubRestart.class,
    HubRestartNeg.class,
    //Issue1586.class, // extremely slow test, for issue1586. Excluding from regression.
    WebDriverPriorityDemo.class, // not yet moved to JUnit
    BrowserTimeOutTest.class,
    CrashWhenStartingBrowserTest.class,
    DefaultProxyFindsFirefoxLocationsTest.class,
    DefaultProxyIsUnregisteredIfDownForTooLongTest.class,
    NodeGoingDownAndUpTest.class, // slow
    NodeRecoveryTest.class,
    NodeTimeOutTest.class,
    SmokeTest.class, // slow
    ExtraServletUtilTest.class,
})
public class GridE2ETests {

}
