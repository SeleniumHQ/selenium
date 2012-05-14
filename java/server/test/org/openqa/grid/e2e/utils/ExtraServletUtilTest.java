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

package org.openqa.grid.e2e.utils;

import org.openqa.grid.web.utils.ExtraServletUtil;
import org.testng.Assert;
import org.testng.annotations.Test;

import javax.servlet.Servlet;

public class ExtraServletUtilTest {


  @Test
  public void exists() {
    String s = "org.openqa.grid.e2e.utils.TestHttpServlet";
    Class<? extends Servlet> servlet = ExtraServletUtil.createServlet(s);
    Assert.assertNotNull(servlet);
  }

  @Test
  public void doesntExist() {
    String s = "org.IDontExist";
    Class<? extends Servlet> servlet = ExtraServletUtil.createServlet(s);
    Assert.assertNull(servlet);
  }
}
