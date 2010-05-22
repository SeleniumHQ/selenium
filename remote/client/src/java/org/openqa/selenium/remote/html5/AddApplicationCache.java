/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.remote.html5;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.html5.AppCacheEntry;
import org.openqa.selenium.html5.AppCacheStatus;
import org.openqa.selenium.html5.AppCacheType;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.InterfaceImplementation;

import com.google.common.collect.Lists;

public class AddApplicationCache implements AugmenterProvider {

  public Class<?> getDescribedInterface() {
    return ApplicationCache.class;
  }

  public InterfaceImplementation getImplementation(Object value) {
    return new InterfaceImplementation() {
      
      public Object invoke(ExecuteMethod executeMethod, Method method, Object... args) {
        if ("getAppCache".equals(method.getName())) {
          List<Object> result = (List<Object>) executeMethod.execute(DriverCommand.GET_APP_CACHE,
              null);
          List<AppCacheEntry> toReturn = Lists.newArrayList();
          for (Object obj : result) {
            Map<String, String> map = (Map<String, String>) obj;
            AppCacheEntry entry = new AppCacheEntry(AppCacheType.valueOf(map.get("type")),
                map.get("url"), map.get("mimeType"));
            toReturn.add(entry);
          }
          return toReturn;
        } else if ("getAppCacheStatus".equals(method.getName())) {
          String result = (String) executeMethod.execute(DriverCommand.GET_APP_CACHE_STATUS, null);
          return AppCacheStatus.valueOf(result);
        }
        return null;
      }
    };
  }
  

}
