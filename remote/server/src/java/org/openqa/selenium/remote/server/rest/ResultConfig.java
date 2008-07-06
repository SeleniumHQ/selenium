package org.openqa.selenium.remote.server.rest;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.io.BufferedReader;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.UndeclaredThrowableException;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.FutureTask;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.openqa.selenium.remote.JsonToBeanConverter;
import org.openqa.selenium.remote.PropertyMunger;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.renderer.EmptyResult;
import org.openqa.selenium.remote.server.renderer.JsonResult;

public class ResultConfig {

  private final String[] sections;
  private final Class<? extends Handler> handlerClazz;
  private final DriverSessions sessions;
  private final Map<ResultType, Set<Result>> resultToRender =
      new HashMap<ResultType, Set<Result>>();

  public ResultConfig(String url, Class<? extends Handler> handlerClazz, DriverSessions sessions) {
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
        throw new RuntimeException(e);
      }
    }

    return handler;
  }

  public ResultConfig on(ResultType success, Renderer renderer) {
    return on(success, renderer, "");
  }

  public ResultConfig on(ResultType success, Renderer renderer, String mimeType) {
    Set<Result> results = resultToRender.get(success);
    if (results == null) {
      results = new LinkedHashSet<Result>();
      resultToRender.put(success, results);
    }
    results.add(new Result(mimeType, renderer));
    return this;
  }


  @SuppressWarnings("unchecked")
public void handle(String pathInfo, final HttpServletRequest request, final HttpServletResponse response)
      throws Exception {
    final Handler handler = getHandler(pathInfo);

    if (handler instanceof JsonParametersAware) {
      BufferedReader reader = new BufferedReader(request.getReader());
      StringBuilder builder = new StringBuilder();
      for (String line = reader.readLine(); line != null; line=reader.readLine())
        builder.append(line);

      String raw = builder.toString();
      if (raw.startsWith("[")) {
        List parameters = new JsonToBeanConverter().convert(List.class, builder.toString());

        ((JsonParametersAware) handler).setJsonParameters(parameters);
      }
    }

    request.setAttribute("handler", handler);

    ResultType result;

    try {
      result = handler.handle();
      addHandlerAttributesToRequest(request, handler);
    } catch (Exception e) {
      result = ResultType.EXCEPTION;
      Throwable toUse = e;
      if (e instanceof UndeclaredThrowableException) {
        // An exception was thrown within an invocation handler. Not smart.
        // Extract the original exception
        toUse = e.getCause().getCause();
      }

      request.setAttribute("exception", toUse);
    }

    Set<Result> results = resultToRender.get(result);
    Result tempToUse = null;
    for (Result res : results) {
      if (tempToUse == null || res.isExactMimeTypeMatch(request.getHeader("Accept"))) {
        tempToUse = res;
      }
    }
    final Result toUse = tempToUse;
    
    if (handler instanceof Callable && !(toUse.getRenderer() instanceof EmptyResult)) {
    	SessionId sessionId = null;
    	
    	if (handler instanceof WebDriverHandler)
    		sessionId = new SessionId(((WebDriverHandler) handler).getSessionId());
    	else
    		System.out.println(handler.getClass().getName());
    	
    	sessions.execute(sessionId, new FutureTask<ResultType>(new Callable<ResultType>() {
			public ResultType call() throws Exception {
				toUse.getRenderer().render(request, response, handler);
				return null;
			}
    	}));
    } else {
    	toUse.getRenderer().render(request, response, handler);
    }
  }

  protected void addHandlerAttributesToRequest(HttpServletRequest request, Handler handler)
      throws Exception {
    BeanInfo info = Introspector.getBeanInfo(handler.getClass());
    PropertyDescriptor[] properties = info.getPropertyDescriptors();
    for (PropertyDescriptor property : properties) {
      Method readMethod = property.getReadMethod();
      if (readMethod == null) {
        continue;
      }

      Object result = readMethod.invoke(handler);
      request.setAttribute(property.getName(), result);
    }
  }
}
