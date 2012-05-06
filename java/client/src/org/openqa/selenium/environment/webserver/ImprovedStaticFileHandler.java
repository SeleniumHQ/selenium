package org.openqa.selenium.environment.webserver;

import java.io.File;
import java.nio.ByteBuffer;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;
import org.webbitserver.handler.StaticFileHandler;

public class ImprovedStaticFileHandler extends StaticFileHandler {

  public ImprovedStaticFileHandler(File dir) {
    super(dir);
    addMimeType("appcache", "text/cache-manifest");
    directoryListingEnabled(true);
  }

  @Override
  protected void serve(final String mimeType,
                       final ByteBuffer contents,
                       HttpControl control,
                       final HttpResponse response,
                       final HttpRequest request) {
    control.execute(new Runnable() {
      public void run() {
        if (mimeType != null) {
          response.header("Content-Type", mimeType.split(";")[0]);
        }

        response
            .header("Content-Length", contents.remaining())
            .content(contents)
            .end();
      }
    });
  }
}
