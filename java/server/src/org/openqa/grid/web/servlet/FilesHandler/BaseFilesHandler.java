package org.openqa.grid.web.servlet.FilesHandler;

import java.io.IOException;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.grid.internal.Registry;

public abstract class BaseFilesHandler {
  public static final String SLIDERS_PATH = "webdriver.server.sliders.path";
  private static String path = null;
  public String getSlidersPath(HttpServlet servlet){
    if(path == null){
      Registry registry = (Registry) servlet.getServletContext().getAttribute(Registry.KEY);
      path = registry.getConfiguration().getScreenSlidersPath();
    }
    return path;
  }

  abstract public void handle(HttpServletRequest request,
      HttpServletResponse response, String filePathName, HttpServlet servlet)
      throws IOException;

}
