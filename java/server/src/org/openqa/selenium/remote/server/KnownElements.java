// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.remote.server;

import com.google.common.collect.BiMap;
import com.google.common.collect.HashBiMap;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsElement;
import org.openqa.selenium.interactions.Locatable;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Proxy;

public class KnownElements {

  private final BiMap<String, WebElement> elements = HashBiMap.create();
  private int nextId;

  public String add(WebElement element) {
    if (elements.containsValue(element)) {
      return elements.inverse().get(element);
    }
    String id = getNextId();
    elements.put(id, proxyElement(element, id));
    return id;
  }

  public WebElement get(String elementId) {
    return elements.get(elementId);
  }

  // WebDriver is single threaded. Expect only a single thread at a time to access this
  private String getNextId() {
    return String.valueOf(nextId++);
  }

  private WebElement proxyElement(final WebElement element, final String id) {
    InvocationHandler handler = (object, method, objects) -> {
      if ("getId".equals(method.getName())) {
        return id;
      } else if ("getWrappedElement".equals(method.getName())) {
        return element;
      } else {
        try {
        return method.invoke(element, objects);
        } catch (InvocationTargetException e) {
          throw e.getTargetException();
        }
      }
    };

    Class<?>[] proxyThese;
    if (element instanceof Locatable) {
      proxyThese = new Class[] {WebElement.class, ProxiedElement.class, Locatable.class};
    } else {
      proxyThese = new Class[] {WebElement.class, ProxiedElement.class};
    }

    return (WebElement) Proxy.newProxyInstance(element.getClass().getClassLoader(),
        proxyThese,
        handler);
  }

  public interface ProxiedElement extends WrapsElement {
    String getId();
  }
}
