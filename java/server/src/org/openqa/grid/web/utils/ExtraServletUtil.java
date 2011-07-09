package org.openqa.grid.web.utils;

import java.util.logging.Logger;

import javax.servlet.Servlet;

public class ExtraServletUtil {

  private static final Logger log = Logger.getLogger(ExtraServletUtil.class.getName());

  /**
   * Reflexion to create the servlet based on the class name. Returns null if
   * the class cannot be instanciated.
   *
   * @param className
   * @return
   */
  public static Class<? extends Servlet> createServlet(String className) {
    try {
      return Class.forName(className).asSubclass(Servlet.class);
    } catch (ClassNotFoundException e) {
      log.warning("The specified class : " + className + " cannot be instanciated " + e.getMessage());
    }
    return null;
  }
}
