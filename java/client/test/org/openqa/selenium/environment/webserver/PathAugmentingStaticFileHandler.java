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
import java.io.IOException;

import org.webbitserver.HttpControl;
import org.webbitserver.HttpRequest;
import org.webbitserver.HttpResponse;

public class PathAugmentingStaticFileHandler extends ImprovedStaticFileHandler {

  private final String leadingPathToDrop;

  public PathAugmentingStaticFileHandler(File dir, String leadingPathToDrop) {
    super(dir);
    this.leadingPathToDrop = leadingPathToDrop;
  }

  @Override
  protected FileWorker createIOWorker(HttpRequest request,
                                      HttpResponse response,
                                      HttpControl control) {
    return new PathAugmentingFileWorker(request, response, control);
  }

  protected class PathAugmentingFileWorker extends FileWorker {
    private PathAugmentingFileWorker(HttpRequest request,
                                     HttpResponse response,
                                     HttpControl control) {
      super(request, response, control);
    }
    
    @Override
    protected File resolveFile(String path) throws IOException {
      if (path.startsWith(leadingPathToDrop)) {
        path = path.substring(leadingPathToDrop.length());
        return super.resolveFile(path);
      } else {
        return null;
      }
    }
  }
}
