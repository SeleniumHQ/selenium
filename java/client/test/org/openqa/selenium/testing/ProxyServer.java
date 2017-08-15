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

package org.openqa.selenium.testing;

import com.google.common.collect.Lists;

import org.littleshoot.proxy.HttpFilters;
import org.littleshoot.proxy.HttpFiltersAdapter;
import org.littleshoot.proxy.HttpFiltersSourceAdapter;
import org.littleshoot.proxy.HttpProxyServer;
import org.littleshoot.proxy.impl.DefaultHttpProxyServer;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.net.NetworkUtils;
import org.openqa.selenium.net.PortProber;

import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.HttpObject;
import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpResponse;

import java.util.List;

public class ProxyServer {
  private HttpProxyServer proxyServer;
  private final String baseUrl;
  private final List<String> uris = Lists.newLinkedList();

  public ProxyServer() {
    int port = PortProber.findFreePort();

    String address = new NetworkUtils().getPrivateLocalAddress();
    baseUrl = String.format("%s:%d", address, port);

    proxyServer = DefaultHttpProxyServer.bootstrap().withAllowLocalOnly(false).withPort(port)
        .withFiltersSource(new HttpFiltersSourceAdapter() {
          public HttpFilters filterRequest(HttpRequest originalRequest, ChannelHandlerContext ctx) {
            return new HttpFiltersAdapter(originalRequest) {
              public HttpResponse clientToProxyRequest(HttpObject httpObject) {
                String uri = originalRequest.uri();
                String[] parts = uri.split("/");
                if (parts.length == 0) {
                  return null;
                }
                String finalPart = parts[parts.length - 1];
                uris.add(finalPart);
                return null;
              }

              @Override
              public HttpObject serverToProxyResponse(HttpObject httpObject) {
                return httpObject;
              }
            };
          }
        })
        .start();
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  /**
   * Checks if a resource has been requested using the short name of the resource.
   *
   * @param resourceName The short name of the resource to check.
   * @return true if the resource has been called.
   */
  public boolean hasBeenCalled(String resourceName) {
    return uris.contains(resourceName);
  }

  public void destroy() {
    proxyServer.stop();
  }

  public Proxy asProxy() {
    Proxy proxy = new Proxy();
    proxy.setHttpProxy(baseUrl);
    return proxy;
  }
}
