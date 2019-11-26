package org.openqa.selenium.firefox.xpi;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import org.junit.Test;
import org.openqa.selenium.firefox.FirefoxBinary;
import org.openqa.selenium.firefox.FirefoxProfile;

import java.io.File;
import java.time.Duration;

public class XpiDriverServiceTest {

  @Test
  public void builderPassesTimeoutToDriverService() {
    File exe = new File("someFile");
    Duration defaultTimeout = Duration.ofSeconds(45);
    Duration customTimeout = Duration.ofSeconds(60);

    FirefoxProfile mockProfile = mock(FirefoxProfile.class);
    FirefoxBinary mockBinary = mock(FirefoxBinary.class);
    XpiDriverService.Builder builderMock = spy(XpiDriverService.Builder.class);
    builderMock.withProfile(mockProfile);
    builderMock.withBinary(mockBinary);
    doReturn(exe).when(builderMock).findDefaultExecutable();
    builderMock.build();

    verify(builderMock).createDriverService(any(), anyInt(), eq(defaultTimeout), any(), any());

    builderMock.withTimeout(customTimeout);
    builderMock.build();
    verify(builderMock).createDriverService(any(), anyInt(), eq(customTimeout), any(), any());
  }
}
