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

package org.openqa.grid.internal;

import org.openqa.grid.common.RegistrationRequest;

import java.net.MalformedURLException;
import java.net.URL;

public class MyCustomProxy extends BaseRemoteProxy {

  public static String MY_STRING = "my string";
  public static URL MY_URL;
  public static boolean MY_BOOLEAN = true;

  public MyCustomProxy(RegistrationRequest request, Registry registry) {

    super(request, registry);
    try {
      MY_URL = new URL("http://www.google.com");
    } catch (MalformedURLException e) {
    }
  }

  public Boolean getBoolean() {
    return MY_BOOLEAN;
  }

  public URL getURL() {
    return MY_URL;
  }

  public String getString() {
    return MY_STRING;
  }

}
