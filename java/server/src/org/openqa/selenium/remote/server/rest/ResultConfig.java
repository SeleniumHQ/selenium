/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.remote.server.rest;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.PropertyMunger;
import org.openqa.selenium.remote.SimplePropertyDescriptor;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;

import com.google.common.collect.Lists;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ResultConfig {

  private final String[] sections;
  private final Class<? extends Handler> handlerClazz;
  private final DriverSessions sessions;
  private final Map<ResultType, Set<Result>> resultToRender =
      new HashMap<ResultType, Set<Result>>();
  private final String url;
  private final Logger log;

  public ResultConfig(String url, Class<? extends Handler> handlerClazz, DriverSessions sessions, Logger log) {
    this.url = url;
    this.log = log;
    if (url == null || handlerClazz == null) {
      throw new IllegalArgumentException("You must specify the handler and the url");
    }

    sections = url.split("/");
    this.handlerClazz = handlerClazz;
    this.sessions = sessions;
  }

  public Handler getHandler(String url) throws Exception {
    if (!isFor(url)) {
      return null;
    }

    return populate(createInstance(handlerClazz), url);
  }

  private Handler createInstance(Class<? extends Handler> handlerClazz) throws Exception {
    try {
      Constructor<? extends Handler> constructor =
          handlerClazz.getConstructor(DriverSessions.class);
      return constructor.newInstance(sessions);
    } catch (NoSuchMethodException e) {
      return handlerClazz.newInstance();
    }
  }

  public boolean isFor(String urlToMatch) {
    String[] allParts = urlToMatch.split("/");

    if (sections.length != allParts.length) {
      return false;
    }

    for (int i = 0; i < sections.length; i++) {
      if (!(sections[i].startsWith(":") || sections[i].equals(allParts[i]))) {
        return false;
      }
    }

    return true;
  }

  protected Handler populate(Handler handler, String pathString) {
    String[] strings = pathString.split("/");

    for (int i = 0; i < sections.length; i++) {
      if (!sections[i].startsWith(":")) {
        continue;
      }
      try {
        PropertyMunger.set(sections[i].substring(1), handler, strings[i]);
      } catch (Exception e) {
        throw new WebDriverException(e);
      }
    }

    return handler;
  }

  public ResultConfig on(ResultType success, Renderer renderer) {
    return on(success, renderer, "");
  }

  /*
  Configure this ResultConfig to handle results of type ResultType with a
  specific renderer. The mimeType is used to distinguish between JSON
  calls and "ordinary" browser pointed at the remote WD Server, which is
  not implemented at all yet.
   */
  public ResultConfig on(ResultType success, Renderer renderer, String mimeType) {
    Set<Result> results = resultToRender.get(success);
    if (results == null) {
      results = new LinkedHashSet<Result>();
      resultToRender.put(success, results);
    }

    // There should not be more than one renderer for each result and
    // mime type.
    for (Result existingResult : results) {
      assert(existingResult.isExactMimeTypeMatch(mimeType) == false);
    }
    results.add(new Result(mimeType, renderer));
    return this;
  }

  public void handle(String pathInfo, final HttpServletRequest request, final HttpServletResponse response)
      throws Exception {
    final Handler handler = getHandler(pathInfo);

    if (handler instanceof JsonParametersAware) {
      setJsonParameters(request, handler);
    }

    request.setAttribute("handler", handler);

    ResultType result;

    try {
      log.info(String.format("Executing: %s at URL: %s)", handler.toString(), pathInfo));
      result = handler.handle();
      addHandlerAttributesToRequest(request, handler);
      log.info("Done: " + pathInfo);
    } catch (Exception e) {
      result = ResultType.EXCEPTION;
      log.log(Level.WARNING, "Exception thrown", e);
      
      Throwable toUse = getRootExceptionCause(e);

      log.warning("Exception: " + toUse.getMessage());
      request.setAttribute("exception", toUse);
      if (handler instanceof WebDriverHandler) {
        request.setAttribute("screen", ((WebDriverHandler) handler).getScreenshot());
      }
    } catch (Error e) {
      log.info("Error: " + e.getMessage());
      result = ResultType.EXCEPTION;
      request.setAttribute("exception", e);
    }

    Set<Result> results = resultToRender.get(result);
    Result tempToUse = null;
    for (Result res : results) {
      if (tempToUse == null || res.isExactMimeTypeMatch(request.getHeader("Accept"))) {
        tempToUse = res;
      }
    }
    final Result toUse = tempToUse;

    if (handler instanceof WebDriverHandler) {
      FutureTask<ResultType> task = new FutureTask<ResultType>(new Callable<ResultType>() {
        public ResultType call() throws Exception {
          toUse.getRenderer().render(request, response, handler);
          return null;
        }
      });

      ((WebDriverHandler) handler).execute(task);
      task.get();
    } else {
      toUse.getRenderer().render(request, response, handler);
    }
  }

  @SuppressWarnings("unchecked")
  private void setJsonParameters(HttpServletRequest request, Handler handler) throws Exception {
    BufferedReader reader = request.getReader();
    StringBuilder builder = new StringBuilder();
    for (String line = reader.readLine(); line != null; line=reader.readLine())
      builder.append(line);

    String raw = builder.toString();
    if (raw.length() > 0) {
      Map<String, Object> parameters = (Map<String, Object>) new JsonToBeanConverter()
          .convert(HashMap.class, builder.toString());

      ((JsonParametersAware) handler).setJsonParameters(parameters);
    }
  }

  protected void addHandlerAttributesToRequest(HttpServletRequest request, Handler handler)
      throws Exception {
    SimplePropertyDescriptor[] properties =
        SimplePropertyDescriptor.getPropertyDescriptors(handler.getClass());
    for (SimplePropertyDescriptor property : properties) {
      Method readMethod = property.getReadMethod();
      if (readMethod == null) {
        continue;
      }

      Object result = readMethod.invoke(handler);
      request.setAttribute(property.getName(), result);
    }
  }

  public Throwable getRootExceptionCause(Throwable originalException) {
    Throwable toReturn = originalException;
    if (originalException instanceof UndeclaredThrowableException) {
      // An exception was thrown within an invocation handler. Not smart.
      // Extract the original exception
      toReturn = originalException.getCause().getCause();
    }

    // When catching an exception here, it is most likely wrapped by
    // several other exceptions. Peel the layers and use the original
    // exception as the one to return to the client. That is the most
    // likely to contain informative data about the error.
    // This is a safety measure to make sure this loop is never endless
    List<Throwable> chain = Lists.newArrayListWithExpectedSize(10);
    for (Throwable current = toReturn; current != null && chain.size() < 10;
         current = current.getCause()) {
      chain.add(current);
    }

    if (chain.isEmpty()) {
      return null;
    }

    // If the root cause came from another server implementing the wire protocol, there might
    // not have been enough information to fully reconstitute its error, in which case we'll
    // want to return the last 2 causes - with the outer error providing context to the
    // true root cause. These case are identified by the root cause not being mappable to a
    // standard WebDriver error code, but its wrapper is mappable.
    //
    // Of course, if we only have one item in our chain, go ahead and return.
    ErrorCodes ec = new ErrorCodes();
    Iterator<Throwable> reversedChain = Lists.reverse(chain).iterator();
    Throwable rootCause = reversedChain.next();
    if (!reversedChain.hasNext() || ec.isMappableError(rootCause)) {
      return rootCause;
    }
    Throwable nextCause = reversedChain.next();
    return ec.isMappableError(nextCause) ? nextCause : rootCause;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof ResultConfig)) {
      return false;
    }

    ResultConfig that = (ResultConfig) o;

    if (!url.equals(that.url)) {
      return false;
    }

    return true;
  }

  @Override
  public int hashCode() {
    return url.hashCode();
  }
}
