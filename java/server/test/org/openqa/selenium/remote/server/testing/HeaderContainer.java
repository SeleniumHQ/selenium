/*
 Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.remote.server.testing;

import com.google.common.base.Supplier;
import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;

import java.text.DateFormat;
import java.text.ParseException;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

class HeaderContainer {

  private final Multimap<String, String> headers;

  protected HeaderContainer() {
    Map<String, Collection<String>> headersMap = Maps.newHashMap();
    this.headers = Multimaps.newListMultimap(headersMap, new Supplier<List<String>>() {
      public List<String> get() {
        return Lists.newLinkedList();
      }
    });
  }
  
  public String getHeader(String name) {
    Collection<String> values = headers.get(name.toLowerCase());
    return values.isEmpty() ? null : values.iterator().next();
  }

  public Enumeration getHeaders(String name) {
    return Collections.enumeration(headers.get(name.toLowerCase()));
  }

  public Enumeration getHeaderNames() {
    return Collections.enumeration(headers.keySet());
  } 
  
  public boolean containsHeader(String name) {
    return headers.containsKey(name.toLowerCase());
  }
  
  public void setDateHeader(String name, long l) {
    setHeader(name, new Date(l).toString());
  }
  
  public void addDateHeader(String name, long l) {
    addHeader(name, new Date(l).toString());
  }
  
  public long getDateHeader(String name) {
    String value = getHeader(name);
    try {
      return value == null ? -1 :
          DateFormat.getDateInstance().parse(value).getTime();
    } catch (ParseException e) {
      throw Throwables.propagate(e);
    }
  }

  public void setHeader(String name, String value) {
    headers.removeAll(name.toLowerCase());
    headers.put(name.toLowerCase(), value);
  }

  public void addHeader(String name, String value) {
    headers.put(name.toLowerCase(), value);
  }

  public void setIntHeader(String name, int i) {
    setHeader(name, String.valueOf(i));
  }

  public void addIntHeader(String name, int i) {
    addHeader(name, String.valueOf(i));
  }
  
  public int getIntHeader(String name) {
    String value = getHeader(name);
    return value == null ? -1 : Integer.valueOf(value);
  }
}
