package org.openqa.selenium.remote;

import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.StringRequestEntity;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.URI;
import org.apache.commons.httpclient.Header;

import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

public class HttpCommandExecutor implements CommandExecutor {

  private final String remotePath;

  private enum HttpVerb {

    GET() {
      public HttpMethod createMethod(String url) {
        GetMethod getMethod = new GetMethod(url);
        getMethod.setFollowRedirects(true);
        return getMethod;
      }
    },
    POST() {
      public HttpMethod createMethod(String url) {
        return new PostMethod(url);
      }
    },
    DELETE() {
      public HttpMethod createMethod(String url) {
        return new DeleteMethod(url);
      }
    };

    public abstract HttpMethod createMethod(String url);
  }

  private Map<String, CommandInfo> nameToUrl = new HashMap<String, CommandInfo>();
  private HttpClient client;

  public HttpCommandExecutor(URL addressOfRemoteServer) throws Exception {
    if (addressOfRemoteServer == null) {
      throw new IllegalArgumentException("You must specify a remote address to connect to");
    }

    this.remotePath = addressOfRemoteServer.getPath();

    URI uri = new URI(addressOfRemoteServer.toString(), false);
    client = new HttpClient();
    client.getHostConfiguration().setHost(uri);

    nameToUrl.put("newSession", new CommandInfo("/session", HttpVerb.POST));
    nameToUrl.put("quit", new CommandInfo("/session/:sessionId", HttpVerb.DELETE));
    nameToUrl.put("get", new CommandInfo("/session/:sessionId/:context/url", HttpVerb.POST));
    nameToUrl
        .put("forward", new CommandInfo("/session/:sessionId/:context/forward", HttpVerb.POST));
    nameToUrl.put("back", new CommandInfo("/session/:sessionId/:context/back", HttpVerb.POST));

    nameToUrl.put("currentUrl", new CommandInfo("/session/:sessionId/:context/url", HttpVerb.GET));
    nameToUrl.put("getTitle", new CommandInfo("/session/:sessionId/:context/title", HttpVerb.GET));
    nameToUrl
        .put("pageSource", new CommandInfo("/session/:sessionId/:context/source", HttpVerb.GET));
    nameToUrl
        .put("setVisible", new CommandInfo("/session/:sessionId/:context/visible", HttpVerb.POST));
    nameToUrl
        .put("getVisible", new CommandInfo("/session/:sessionId/:context/visible", HttpVerb.GET));
    nameToUrl
        .put("findElement", new CommandInfo("/session/:sessionId/:context/element", HttpVerb.POST));
    nameToUrl.put("findElements",
                  new CommandInfo("/session/:sessionId/:context/elements", HttpVerb.POST));
    nameToUrl.put("getChildrenOfType", new CommandInfo(
        "/session/:sessionId/:context/element/:id/children/:name", HttpVerb.POST));

    nameToUrl
        .put("findElementUsingElement", new CommandInfo("/session/:sessionId/:context/element/:id/element/:using", HttpVerb.POST));
    nameToUrl.put("findElementsUsingElement",
                  new CommandInfo("/session/:sessionId/:context/element/:id/elements/:using", HttpVerb.POST));
    nameToUrl.put("clickElement",
                  new CommandInfo("/session/:sessionId/:context/element/:id/click", HttpVerb.POST));
    nameToUrl.put("clearElement",
                  new CommandInfo("/session/:sessionId/:context/element/:id/clear", HttpVerb.POST));
    nameToUrl.put("submitElement", new CommandInfo(
        "/session/:sessionId/:context/element/:id/submit", HttpVerb.POST));
    nameToUrl.put("getElementText",
                  new CommandInfo("/session/:sessionId/:context/element/:id/text", HttpVerb.GET));
    nameToUrl.put("sendKeys",
                  new CommandInfo("/session/:sessionId/:context/element/:id/value", HttpVerb.POST));
    nameToUrl.put("getElementValue",
                  new CommandInfo("/session/:sessionId/:context/element/:id/value", HttpVerb.GET));
    nameToUrl.put("isElementSelected", new CommandInfo(
        "/session/:sessionId/:context/element/:id/selected", HttpVerb.GET));
    nameToUrl.put("setElementSelected", new CommandInfo(
        "/session/:sessionId/:context/element/:id/selected", HttpVerb.POST));
    nameToUrl.put("toggleElement", new CommandInfo(
        "/session/:sessionId/:context/element/:id/toggle", HttpVerb.POST));
    nameToUrl.put("isElementEnabled", new CommandInfo(
        "/session/:sessionId/:context/element/:id/enabled", HttpVerb.GET));
    nameToUrl.put("isElementDisplayed", new CommandInfo(
        "/session/:sessionId/:context/element/:id/displayed", HttpVerb.GET));
    nameToUrl.put("getElementLocation", new CommandInfo(
        "/session/:sessionId/:context/element/:id/location", HttpVerb.GET));
    nameToUrl.put("getElementSize",
                  new CommandInfo("/session/:sessionId/:context/element/:id/size", HttpVerb.GET));

    nameToUrl.put("getElementAttribute",
                  new CommandInfo("/session/:sessionId/:context/element/:id/:name", HttpVerb.GET));

    nameToUrl
        .put("getAllCookies", new CommandInfo("/session/:sessionId/:context/cookie", HttpVerb.GET));
    nameToUrl
        .put("addCookie", new CommandInfo("/session/:sessionId/:context/cookie", HttpVerb.POST));
    nameToUrl.put("deleteAllCookies",
                  new CommandInfo("/session/:sessionId/:context/cookie", HttpVerb.DELETE));
    nameToUrl.put("deleteCookie",
                  new CommandInfo("/session/:sessionId/:context/cookie/:name", HttpVerb.DELETE));

    nameToUrl.put("switchToFrame",
                  new CommandInfo("/session/:sessionId/:context/frame/:id", HttpVerb.POST));
    nameToUrl.put("switchToWindow",
                  new CommandInfo("/session/:sessionId/:context/window/:name", HttpVerb.POST));
    nameToUrl.put("close", new CommandInfo("/session/:sessionId/:context/window", HttpVerb.DELETE));

    nameToUrl.put("dragElement",
                  new CommandInfo("/session/:sessionId/:context/element/:id/drag", HttpVerb.POST));

    nameToUrl.put("getSpeed",
                  new CommandInfo("/session/:sessionId/:context/speed", HttpVerb.GET));
    nameToUrl.put("setSpeed",
                  new CommandInfo("/session/:sessionId/:context/speed", HttpVerb.POST));

    nameToUrl.put("getValueOfCssProperty",
                  new CommandInfo("/session/:sessionId/:context/element/:id/css/:propertyName", HttpVerb.GET));
  }

  public Response execute(Command command) throws Exception {
    CommandInfo info = nameToUrl.get(command.getMethodName());
    HttpMethod httpMethod = info.getMethod(remotePath, command);

    httpMethod.addRequestHeader("Accept", "application/json");

    String payload = new BeanToJsonConverter().convert(command.getParameters());

    if (httpMethod instanceof PostMethod) {
      ((PostMethod) httpMethod)
          .setRequestEntity(new StringRequestEntity(payload, "application/json", "UTF-8"));
    }

    client.executeMethod(httpMethod);

    // TODO: SimonStewart: 2008-04-25: This is really shabby
    if (isRedirect(httpMethod)) {
      Header newLocation = httpMethod.getResponseHeader("location");
      httpMethod = new GetMethod(newLocation.getValue());
      httpMethod.setFollowRedirects(true);
      httpMethod.addRequestHeader("Accept", "application/json");
      client.executeMethod(httpMethod);
    }

    return createResponse(httpMethod);
  }

  private Response createResponse(HttpMethod httpMethod) throws Exception {
    Response response;

    Header header = httpMethod.getResponseHeader("Content-Type");

    if (header != null && header.getValue().startsWith("application/json")) {
      response =
          new JsonToBeanConverter().convert(Response.class, httpMethod.getResponseBodyAsString());
    } else {
      response = new Response();
      response.setValue(httpMethod.getResponseBodyAsString());
      String uri = httpMethod.getURI().toString();
      int sessionIndex = uri.indexOf("/session/");
      if (sessionIndex != -1) {
        sessionIndex += "/session/".length();
        int nextSlash = uri.indexOf("/", sessionIndex);
        if (nextSlash != -1) {
          response.setSessionId(uri.substring(sessionIndex, nextSlash));
          response.setContext("foo");
        }
      }
    }
    response.setError(!(httpMethod.getStatusCode() > 199 && httpMethod.getStatusCode() < 300));

    return response;
  }

  private boolean isRedirect(HttpMethod httpMethod) {
    int code = httpMethod.getStatusCode();
    return (code == 301 || code == 302 || code == 303 || code == 307)
           && httpMethod.getResponseHeader("location") != null;
  }

  private static class CommandInfo {

    private final String url;
    private final HttpVerb verb;

    public CommandInfo(String url, HttpVerb verb) {
      this.url = url;
      this.verb = verb;
    }

    public HttpMethod getMethod(String base, Command command) {
      StringBuilder urlBuilder = new StringBuilder(base);
      for (String part : url.split("/")) {
        if (part.length() == 0) {
          continue;
        }

        urlBuilder.append("/");
        if (part.startsWith(":")) {
          String value = get(part.substring(1), command);
          if (value != null) {
            urlBuilder.append(get(part.substring(1), command));
          }
        } else {
          urlBuilder.append(part);
        }
      }

      return verb.createMethod(urlBuilder.toString());
    }

    @SuppressWarnings("unchecked")
    private String get(String propertyName, Command command) {
      if ("sessionId".equals(propertyName)) {
        return command.getSessionId().toString();
      }
      if ("context".equals(propertyName)) {
        return command.getContext().toString();
      }

      // Attempt to extract the property name from the parameters
      if (command.getParameters().length > 0 && command.getParameters()[0] instanceof Map) {
        Object value = ((Map) command.getParameters()[0]).get(propertyName);
        if (value != null) {
          try {
            return URLEncoder.encode(String.valueOf(value), "UTF-8");
          } catch (UnsupportedEncodingException e) {
            // Can never happen. UTF-8 ships with java
            return String.valueOf(value);
          }
        }
        return null;
      }

      throw new IllegalArgumentException("Cannot determine property: " + propertyName);
    }
  }
}
