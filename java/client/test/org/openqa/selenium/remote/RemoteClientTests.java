package org.openqa.selenium.remote;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;
import org.openqa.selenium.remote.internal.CircularOutputStreamTest;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    AugmenterTest.class,
    ErrorHandlerTest.class,
    CircularOutputStreamTest.class
})
public class RemoteClientTests {
}
