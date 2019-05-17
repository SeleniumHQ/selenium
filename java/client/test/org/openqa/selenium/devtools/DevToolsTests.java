package org.openqa.selenium.devtools;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    ChromeDevToolsNetworkTest.class,
    ChromeDevToolsPerformanceTest.class
})
public class DevToolsTests {

}
