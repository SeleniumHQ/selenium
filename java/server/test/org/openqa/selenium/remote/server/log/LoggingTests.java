package org.openqa.selenium.remote.server.log;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({
    DefaultPerSessionLogHandlerUnitTest.class,
    LoggingManagerUnitTest.class,
    ShortTermMemoryHandlerUnitTest.class
})
public class LoggingTests {}
