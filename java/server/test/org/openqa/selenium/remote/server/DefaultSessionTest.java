package org.openqa.selenium.remote.server;

import org.jmock.Expectations;
import org.jmock.lib.legacy.ClassImposteriser;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MockTestBase;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.remote.DesiredCapabilities;

public class DefaultSessionTest extends MockTestBase {

  @Before
  public void addImposteriser() {
    context.setImposteriser(ClassImposteriser.INSTANCE);
  }

  @Test
  public void shouldClearTempFsWhenSessionCloses() throws Exception {
    final DriverFactory factory = new StubDriverFactory();
    final TemporaryFilesystem tempFs = mock(TemporaryFilesystem.class);

    checking(new Expectations() {{
      oneOf(tempFs).deleteTemporaryFiles();
    }});

    Session session = DefaultSession.createSession(factory, tempFs, null, DesiredCapabilities.firefox());

    session.close();
  }

  private class StubDriverFactory implements DriverFactory {
    public void registerDriver(Capabilities capabilities, Class<? extends WebDriver> impl) {
    }

    public WebDriver newInstance(Capabilities capabilities) {
      return new StubDriver();
    }

    public boolean hasMappingFor(Capabilities capabilities) {
      return true;
    }
  }
}
