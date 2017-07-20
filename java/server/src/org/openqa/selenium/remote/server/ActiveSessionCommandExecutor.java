package org.openqa.selenium.remote.server;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.util.Objects;

public class ActiveSessionCommandExecutor implements CommandExecutor {

  private final ActiveSession session;
  private boolean active;

  public ActiveSessionCommandExecutor(ActiveSession session) {
    this.session = Objects.requireNonNull(session, "Session must not be null");
  }

  @Override
  public Response execute(Command command) throws IOException {
    if (DriverCommand.NEW_SESSION.equals(command.getName())) {
      if (active) {
        throw new WebDriverException("Cannot start session twice! " + session);
      }

      active = true;

      // We already have a running session.
      Response response = new Response(session.getId());
      response.setValue(session.getCapabilities());
      return response;
    }

    HttpRequest request = session.getUpstreamDialect().getCommandCodec().encode(command);

    HttpResponse httpResponse = new HttpResponse();
    session.execute(request, httpResponse);

    return session.getDownstreamDialect().getResponseCodec().decode(httpResponse);
  }
}
