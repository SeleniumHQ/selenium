package org.openqa.selenium.remote;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    BeanToJsonConverterTest.class,
    DesiredCapabilitiesTest.class,
    JsonToBeanConverterTest.class
})
public class RemoteCommonTests {
}
