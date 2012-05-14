/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


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
