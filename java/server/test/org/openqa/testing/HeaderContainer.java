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

package org.openqa.testing;

import com.google.common.collect.ArrayListMultimap;
import com.google.common.collect.Multimap;

import java.text.DateFormat;
import java.text.ParseException;
import java.util.Collection;
import java.util.Date;

class HeaderContainer {

  private final Multimap<String, String> headers;

  protected HeaderContainer() {
    this.headers = ArrayListMultimap.create();
  }

  public String getHeader(String name) {
    Collection<String> values = headers.get(name.toLowerCase());
    return values.isEmpty() ? null : values.iterator().next();
  }

  protected Multimap<String, String> getHeaders() {
    return headers;
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
      throw new RuntimeException(e);
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
