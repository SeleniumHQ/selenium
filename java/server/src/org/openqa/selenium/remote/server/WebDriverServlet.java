package org.openqa.selenium.remote.server;

import static java.util.concurrent.TimeUnit.MINUTES;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalListener;

import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.SessionId;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeoutException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class WebDriverServlet extends HttpServlet {

  public static final String SESSIONS_KEY = DriverServlet.class.getName() + ".sessions";
  public static final String ACTIVE_SESSIONS_KEY = WebDriverServlet.class.getName() + ".sessions";

  private final ExecutorService executor = Executors.newCachedThreadPool();
  private Cache<SessionId, ActiveSession> allSessions;
  private DriverSessions legacyDriverSessions;
  private AllHandlers handlers;

  @Override
  public void init() throws ServletException {
    log("Initialising WebDriverServlet");
    legacyDriverSessions = (DriverSessions) getServletContext().getAttribute(SESSIONS_KEY);
    if (legacyDriverSessions == null) {
      legacyDriverSessions = new DefaultDriverSessions(
          Platform.getCurrent(),
          new DefaultDriverFactory(),
          new SystemClock());
      getServletContext().setAttribute(SESSIONS_KEY, legacyDriverSessions);
    }

    allSessions = (Cache<SessionId, ActiveSession>) getServletContext().getAttribute(ACTIVE_SESSIONS_KEY);
    if (allSessions == null) {
      RemovalListener<SessionId, ActiveSession> listener = notification -> {
        log(String.format("Removing session %s: %s", notification.getKey(), notification.getCause()));
        ActiveSession session = notification.getValue();
        session.stop();
        legacyDriverSessions.deleteSession(notification.getKey());

        log(String.format("Post removal: %s and %s", allSessions.asMap(), legacyDriverSessions.getSessions()));
      };

      allSessions = CacheBuilder.newBuilder()
          .expireAfterAccess(10, MINUTES)
          .removalListener(listener)
          .build();

      getServletContext().setAttribute(ACTIVE_SESSIONS_KEY, allSessions);
    }

    handlers = new AllHandlers(allSessions, legacyDriverSessions);
  }

  @Override
  protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    handle(req, resp);
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    handle(req, resp);
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    handle(req, resp);
  }

  private void handle(HttpServletRequest req, HttpServletResponse resp) {
    CommandHandler handler = handlers.match(req);

    log("Found handler: " + handler);

    boolean invalidateSession =
        handler instanceof ActiveSession &&
        "DELETE".equalsIgnoreCase(req.getMethod()) &&
        req.getPathInfo().equals("/session/" + ((ActiveSession) handler).getId());

    Future<?> execution = executor.submit(() -> {
      try {
        if (handler instanceof ActiveSession) {
          Thread.currentThread().setName(((ActiveSession) handler).getDescription());
        } else {
          Thread.currentThread().setName(req.getPathInfo());
        }
        handler.execute(req, resp);
      } catch (IOException e) {
        resp.reset();
        throw new RuntimeException(e);
      } finally {
        Thread.currentThread().setName("Selenium WebDriver Servlet - Quiescent Thread");
      }
    });

    try {
      execution.get(1, MINUTES);
    } catch (ExecutionException e) {
      resp.reset();
      new ExceptionHandler(e).execute(req, resp);
    } catch (InterruptedException e) {
      log("Unexpectedly interrupted: " + e.getMessage(), e);
      invalidateSession = true;

      Thread.currentThread().interrupt();
    } catch (TimeoutException e) {
      invalidateSession = true;
    }

    if (invalidateSession && handler instanceof ActiveSession) {
      allSessions.invalidate(((ActiveSession) handler).getId());
    }
  }
}
