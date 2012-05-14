/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

package org.openqa.grid.web.utils;

import java.util.logging.Logger;

import javax.servlet.Servlet;

public class ExtraServletUtil {

  private static final Logger log = Logger.getLogger(ExtraServletUtil.class.getName());

  /**
   * Reflexion to create the servlet based on the class name. Returns null if the class cannot be
   * instanciated.
   * 
   * @param className
   * @return Class object for passed className argument, or <i/null</i> if no
   *         matching class name can be found.
   */
  public static Class<? extends Servlet> createServlet(String className) {
    try {
      return Class.forName(className).asSubclass(Servlet.class);
    } catch (ClassNotFoundException e) {
      log.warning("The specified class : " + className + " cannot be instanciated " +
          e.getMessage());
    }
    return null;
  }
}
