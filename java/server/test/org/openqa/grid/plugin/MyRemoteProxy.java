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

package org.openqa.grid.plugin;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.Registry;


public class MyRemoteProxy extends BaseRemoteProxy {
  private String custom1;
  private String custom2;

  public MyRemoteProxy(RegistrationRequest request, Registry registry) {
    super(request, registry);
    custom1 = request.getConfiguration().get("Custom1").toString();
    custom2 = request.getConfiguration().get("Custom2").toString();
  }

  public String getCustom1() {
    return custom1;
  }

  public String getCustom2() {
    return custom2;
  }

}
