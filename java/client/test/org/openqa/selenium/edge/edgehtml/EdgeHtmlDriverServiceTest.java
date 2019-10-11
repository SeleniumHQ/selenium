package org.openqa.selenium.edge.edgehtml;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import org.junit.Test;

import java.io.File;
import java.time.Duration;

public class EdgeHtmlDriverServiceTest {

  @Test
  public void builderPassesTimeoutToDriverService() {
    File exe = new File("someFile");
    Duration defaultTimeout = Duration.ofSeconds(20);
    Duration customTimeout = Duration.ofSeconds(60);

    EdgeHtmlDriverService.Builder builderMock = spy(EdgeHtmlDriverService.Builder.class);
    doReturn(exe).when(builderMock).findDefaultExecutable();
    builderMock.build();

    verify(builderMock).createDriverService(any(), anyInt(), eq(defaultTimeout), any(), any());

    builderMock.withTimeout(customTimeout);
    builderMock.build();
    verify(builderMock).createDriverService(any(), anyInt(), eq(customTimeout), any(), any());
  }
}
