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
  protected IOWorker createIOWorker(HttpRequest request,
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
