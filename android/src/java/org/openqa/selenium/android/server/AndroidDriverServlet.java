/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android.server;

import javax.servlet.ServletException;

import org.openqa.selenium.android.server.handler.DragElement;
import org.openqa.selenium.android.server.handler.GetCssProperty;
import org.openqa.selenium.android.server.handler.GetElementDisplayed;
import org.openqa.selenium.android.server.handler.GetElementLocation;
import org.openqa.selenium.android.server.handler.GetElementSize;
import org.openqa.selenium.android.server.handler.HoverOverElement;
import org.openqa.selenium.remote.server.DriverServlet;
import org.openqa.selenium.remote.server.renderer.EmptyResult;
import org.openqa.selenium.remote.server.renderer.JsonResult;
import org.openqa.selenium.remote.server.rest.ResultType;

public class AndroidDriverServlet extends DriverServlet {
  @Override
  public void init() throws ServletException {
    super.init();
    try {
      addNewGetMapping("/session/:sessionId/element/:id/displayed", GetElementDisplayed.class).on(
          ResultType.SUCCESS, new JsonResult(":response"));
      addNewGetMapping("/session/:sessionId/element/:id/location", GetElementLocation.class).on(
          ResultType.SUCCESS, new JsonResult(":response"));
      addNewGetMapping("/session/:sessionId/element/:id/size", GetElementSize.class).on(
          ResultType.SUCCESS, new JsonResult(":response"));
      addNewGetMapping("/session/:sessionId/element/:id/css/:propertyName", GetCssProperty.class).on(
          ResultType.SUCCESS, new JsonResult(":response"));

      addNewPostMapping("/session/:sessionId/element/:id/hover", HoverOverElement.class).on(
          ResultType.SUCCESS, new EmptyResult());
      addNewPostMapping("/session/:sessionId/element/:id/drag", DragElement.class).on(
          ResultType.SUCCESS, new EmptyResult());

    } catch (Exception e) {
      throw new ServletException(e);
    }
  }
}
