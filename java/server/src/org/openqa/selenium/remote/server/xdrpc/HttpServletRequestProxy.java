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

package org.openqa.selenium.remote.server.xdrpc;

import static com.google.common.base.Preconditions.checkNotNull;

import com.google.common.base.Throwables;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

/**
 * Serves as a proxy to a {@link HttpServletRequest} for a WebDriver command
 * described by a {@link CrossDomainRpc}.
 */
public class HttpServletRequestProxy implements InvocationHandler {

  private final HttpServletRequest proxiedRequest;
  private final CrossDomainRpc crossDomainRpc;
  private final String xdrpcPath;
  private final String mimeType;

  private HttpServletRequestProxy(HttpServletRequest proxiedRequest,
      CrossDomainRpc crossDomainRpc, String xdrpcPath, String mimeType) {
    this.proxiedRequest = proxiedRequest;
    this.crossDomainRpc = crossDomainRpc;
    this.xdrpcPath = xdrpcPath;
    this.mimeType = mimeType;
  }

  /**
   * Creates a new proxy.
   *
   * @param request The request to override with the proxy.
   * @param crossDomainRpc The RPC with the command parameters to patch in.
   * @param xdrpcPath The servlet path for the cross-domain request handler;
   *     this path will be stripped from the original request in favor of the
   *     {@link CrossDomainRpc#getPath() RPC path}.
   * @param mimeType The mime-type that should be assigned to the proxied
   *     request.
   * @return The new request object.
   */
  public static HttpServletRequest createProxy(HttpServletRequest request,
      CrossDomainRpc crossDomainRpc, String xdrpcPath, String mimeType) {
    checkNotNull(request);
    checkNotNull(crossDomainRpc);
    checkNotNull(xdrpcPath);
    checkNotNull(mimeType);

    return (HttpServletRequest) Proxy.newProxyInstance(
        request.getClass().getClassLoader(),
        request.getClass().getInterfaces(),
        new HttpServletRequestProxy(request, crossDomainRpc, xdrpcPath,
            mimeType));
  }

  private String trimCrossDomainRpcPath(String str) {
    return str.substring(0, str.indexOf(xdrpcPath));
  }

  public Object invoke(Object proxy, Method method, Object[] args)
      throws Throwable {
    if ("getMethod".equals(method.getName())) {
      return crossDomainRpc.getMethod();
    }

    if ("getRequestURL".equals(method.getName())) {
      String realUrl = proxiedRequest.getRequestURL().toString();
      return new StringBuffer()
          .append(trimCrossDomainRpcPath(realUrl))
          .append(crossDomainRpc.getPath());
    }

    if ("getRequestURI".equals(method.getName())) {
      return trimCrossDomainRpcPath(proxiedRequest.getRequestURI())
          + crossDomainRpc.getPath();
    }

    if ("getPathInfo".equals(method.getName())) {
      return crossDomainRpc.getPath();
    }

    if ("getReader".equals(method.getName())) {
      return crossDomainRpc.getDataReader();
    }

    if ("getHeader".equals(method.getName())) {
      String headerName = (String) args[0];
      if ("accept".equalsIgnoreCase(headerName)) {
        return mimeType;
      }
    }

    try {
      return method.invoke(proxiedRequest, args);
    } catch (InvocationTargetException e) {
      throw e.getTargetException();
    } catch (Exception e) {
      throw Throwables.propagate(e);
    }
  }
}
