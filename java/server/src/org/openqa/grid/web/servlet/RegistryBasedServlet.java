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
package org.openqa.grid.web.servlet;

import org.openqa.grid.internal.Registry;

import javax.servlet.http.HttpServlet;

public abstract class RegistryBasedServlet extends HttpServlet {
  private Registry registry;

  public RegistryBasedServlet(Registry registry) {
    this.registry = registry;
  }

  protected Registry getRegistry() {
    if (registry == null) {
      registry = (Registry) getServletContext().getAttribute(Registry.KEY);
    }

    return registry;
  }
}
