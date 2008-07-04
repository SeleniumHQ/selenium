package org.openqa.selenium.remote.server;

import org.openqa.selenium.remote.server.handler.AddCookie;
import org.openqa.selenium.remote.server.handler.ChangeUrl;
import org.openqa.selenium.remote.server.handler.ClearElement;
import org.openqa.selenium.remote.server.handler.ClickElement;
import org.openqa.selenium.remote.server.handler.CloseWindow;
import org.openqa.selenium.remote.server.handler.DeleteCookie;
import org.openqa.selenium.remote.server.handler.DeleteNamedCookie;
import org.openqa.selenium.remote.server.handler.DeleteSession;
import org.openqa.selenium.remote.server.handler.DescribeElement;
import org.openqa.selenium.remote.server.handler.DragElement;
import org.openqa.selenium.remote.server.handler.FindChildElements;
import org.openqa.selenium.remote.server.handler.FindElement;
import org.openqa.selenium.remote.server.handler.FindElements;
import org.openqa.selenium.remote.server.handler.GetAllCookies;
import org.openqa.selenium.remote.server.handler.GetCurrentUrl;
import org.openqa.selenium.remote.server.handler.GetElementAttribute;
import org.openqa.selenium.remote.server.handler.GetElementDisplayed;
import org.openqa.selenium.remote.server.handler.GetElementEnabled;
import org.openqa.selenium.remote.server.handler.GetElementLocation;
import org.openqa.selenium.remote.server.handler.GetElementSelected;
import org.openqa.selenium.remote.server.handler.GetElementSize;
import org.openqa.selenium.remote.server.handler.GetElementText;
import org.openqa.selenium.remote.server.handler.GetElementValue;
import org.openqa.selenium.remote.server.handler.GetMouseSpeed;
import org.openqa.selenium.remote.server.handler.GetPageSource;
import org.openqa.selenium.remote.server.handler.GetSessionCapabilities;
import org.openqa.selenium.remote.server.handler.GetTitle;
import org.openqa.selenium.remote.server.handler.GetVisible;
import org.openqa.selenium.remote.server.handler.GoBack;
import org.openqa.selenium.remote.server.handler.GoForward;
import org.openqa.selenium.remote.server.handler.NewSession;
import org.openqa.selenium.remote.server.handler.SendKeys;
import org.openqa.selenium.remote.server.handler.SetElementSelected;
import org.openqa.selenium.remote.server.handler.SetMouseSpeed;
import org.openqa.selenium.remote.server.handler.SetVisible;
import org.openqa.selenium.remote.server.handler.SubmitElement;
import org.openqa.selenium.remote.server.handler.SwitchToFrame;
import org.openqa.selenium.remote.server.handler.SwitchToWindow;
import org.openqa.selenium.remote.server.handler.ToggleElement;
import org.openqa.selenium.remote.server.renderer.EmptyResult;
import org.openqa.selenium.remote.server.renderer.ForwardResult;
import org.openqa.selenium.remote.server.renderer.JsonErrorExceptionResult;
import org.openqa.selenium.remote.server.renderer.JsonResult;
import org.openqa.selenium.remote.server.renderer.RedirectResult;
import org.openqa.selenium.remote.server.rest.ResultConfig;
import org.openqa.selenium.remote.server.rest.ResultType;
import org.openqa.selenium.remote.server.rest.UrlMapper;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DriverServlet extends HttpServlet {

  private UrlMapper getMapper;
  private UrlMapper postMapper;
  private UrlMapper deleteMapper;

  @Override
  public void init() throws ServletException {
    super.init();

    DriverSessions driverSessions = new DriverSessions();

    getMapper = new UrlMapper(driverSessions);
    postMapper = new UrlMapper(driverSessions);
    deleteMapper = new UrlMapper(driverSessions);

    getMapper.addGlobalHandler(ResultType.EXCEPTION,
                               new JsonErrorExceptionResult(":exception", ":response"));
    postMapper.addGlobalHandler(ResultType.EXCEPTION,
                                new JsonErrorExceptionResult(":exception", ":response"));
    deleteMapper.addGlobalHandler(ResultType.EXCEPTION,
                                  new JsonErrorExceptionResult(":exception", ":response"));

    postMapper.bind("/session", NewSession.class)
        .on(ResultType.SUCCESS, new RedirectResult("/session/:sessionId/:context"));
    getMapper.bind("/session/:sessionId/:context", GetSessionCapabilities.class)
        .on(ResultType.SUCCESS, new ForwardResult("/WEB-INF/views/sessionCapabilities.jsp"))
        .on(ResultType.SUCCESS, new JsonResult(":response"), "application/json");

    deleteMapper.bind("/session/:sessionId", DeleteSession.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/:context/url", ChangeUrl.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/url", GetCurrentUrl.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/forward", GoForward.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/back", GoBack.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/:context/source", GetPageSource.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    getMapper.bind("/session/:sessionId/:context/title", GetTitle.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/visible", SetVisible.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/visible", GetVisible.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element", FindElement.class).on(
        ResultType.SUCCESS, new RedirectResult("/session/:sessionId/:context/element/:element"));
    getMapper.bind("/session/:sessionId/:context/element/:elementId", DescribeElement.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/elements", FindElements.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper
        .bind("/session/:sessionId/:context/element/:id/children/:name", FindChildElements.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element/:id/click", ClickElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/element/:id/text", GetElementText.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/element/:id/submit", SubmitElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/:context/element/:id/value", SendKeys.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/element/:id/value", GetElementValue.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element/:id/clear", ClearElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    getMapper.bind("/session/:sessionId/:context/element/:id/selected", GetElementSelected.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/element/:id/selected", SetElementSelected.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/element/:id/toggle", ToggleElement.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/enabled", GetElementEnabled.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/displayed", GetElementDisplayed.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/location", GetElementLocation.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    getMapper.bind("/session/:sessionId/:context/element/:id/size", GetElementSize.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    postMapper.bind("/session/:sessionId/:context/element/:id/drag", DragElement.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/:context/element/:id/:name", GetElementAttribute.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));

    getMapper.bind("/session/:sessionId/:context/cookie", GetAllCookies.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/cookie", AddCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/:context/cookie", DeleteCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/:context/cookie/:name", DeleteNamedCookie.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    postMapper.bind("/session/:sessionId/:context/frame", SwitchToFrame.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/frame/:id", SwitchToFrame.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    postMapper.bind("/session/:sessionId/:context/window/:name", SwitchToWindow.class)
        .on(ResultType.SUCCESS, new EmptyResult());
    deleteMapper.bind("/session/:sessionId/:context/window", CloseWindow.class)
        .on(ResultType.SUCCESS, new EmptyResult());

    getMapper.bind("/session/:sessionId/:context/speed/mouse", GetMouseSpeed.class)
        .on(ResultType.SUCCESS, new JsonResult(":response"));
    postMapper.bind("/session/:sessionId/:context/speed/mouse", SetMouseSpeed.class)
        .on(ResultType.SUCCESS, new EmptyResult());
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(getMapper, request, response);
  }

  @Override
  protected void doPost(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(postMapper, request, response);
  }


  @Override
  protected void doDelete(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
    handleRequest(deleteMapper, request, response);
  }

  protected void handleRequest(UrlMapper mapper, HttpServletRequest request,
                               HttpServletResponse response)
      throws ServletException {
    try {
      ResultConfig config = mapper.getConfig(request.getPathInfo());
      config.handle(request.getPathInfo(), request, response);
    } catch (Exception e) {
      throw new ServletException(e);
    }
  }

}
