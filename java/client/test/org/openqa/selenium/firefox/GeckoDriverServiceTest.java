package org.openqa.selenium.firefox;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import org.junit.Test;
import org.openqa.selenium.firefox.GeckoDriverService;

import java.io.File;
import java.time.Duration;

public class GeckoDriverServiceTest {

  @Test
  public void builderPassesTimeoutToDriverService() {
    File exe = new File("someFile");
    Duration defaultTimeout = Duration.ofSeconds(20);
    Duration customTimeout = Duration.ofSeconds(60);

    GeckoDriverService.Builder builderMock = spy(GeckoDriverService.Builder.class);
    doReturn(exe).when(builderMock).findDefaultExecutable();
    builderMock.build();

    verify(builderMock).createDriverService(any(), anyInt(), eq(defaultTimeout), any(), any());

    builderMock.withTimeout(customTimeout);
    builderMock.build();
    verify(builderMock).createDriverService(any(), anyInt(), eq(customTimeout), any(), any());
  }
}
