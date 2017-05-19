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

import com.google.common.base.Strings;
import com.google.common.base.Suppliers;
import com.google.common.collect.Iterators;
import com.google.common.io.ByteStreams;

import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.function.Supplier;

import javax.servlet.http.HttpServletRequest;

class WrappedHttpRequest extends HttpRequest {

  private final HttpServletRequest delegate;
  private final Supplier<byte[]> readBytes;

  public WrappedHttpRequest(HttpServletRequest req) {
    super(
        HttpMethod.valueOf(req.getMethod().toUpperCase()),
        Strings.isNullOrEmpty(req.getPathInfo()) ? "/" : req.getPathInfo());

    this.delegate = req;

    this.readBytes = Suppliers.memoize(() -> {
      try (BufferedInputStream in = new BufferedInputStream(req.getInputStream())) {
        return ByteStreams.toByteArray(in);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    });
  }

  @Override
  public void setHeader(String name, String value) {
    throw new UnsupportedOperationException("setHeader");
  }

  @Override
  public void setContent(byte[] data) {
    throw new UnsupportedOperationException("setContent");
  }

  @Override
  public void setContent(InputStream toStreamFrom) {
    throw new UnsupportedOperationException("setContent");
  }

  @Override
  public byte[] getContent() {
    return readBytes.get();
  }

  @Override
  public Iterable<String> getHeaderNames() {
    return () -> Iterators.forEnumeration(delegate.getHeaderNames());
  }

  @Override
  public Iterable<String> getHeaders(String name) {
    return () -> Iterators.forEnumeration(delegate.getHeaders(name));
  }
}
