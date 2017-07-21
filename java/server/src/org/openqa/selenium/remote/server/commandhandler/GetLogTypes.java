package org.openqa.selenium.remote.server.commandhandler;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import com.google.common.collect.ImmutableSet;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.remote.server.ActiveSession;
import org.openqa.selenium.remote.server.CommandHandler;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.Map;
import java.util.Objects;

public class GetLogTypes implements CommandHandler {

  private static final Type MAP_TYPE = new TypeToken<Map<String, Object>>(){}.getType();
  private final Gson gson;
  private final ActiveSession session;

  public GetLogTypes(Gson gson, ActiveSession session) {
    this.gson = Objects.requireNonNull(gson);
    this.session = Objects.requireNonNull(session);
  }

  @Override
  public void execute(HttpRequest req, HttpResponse resp) throws IOException {
    // Try going upstream first. It's okay if this fails.
    HttpRequest upReq = new HttpRequest(POST, String.format("/session/%s/log", session.getId()));
    HttpResponse upRes = new HttpResponse();
    session.execute(upReq, upRes);

    ImmutableSet.Builder<String> types = ImmutableSet.builder();
    types.add(LogType.SERVER);

    if (upRes.getStatus() == HTTP_OK) {
      Map<String, Object> upstream = gson.fromJson(upRes.getContentString(), MAP_TYPE);
      Object raw = upstream.get("value");
      if (raw instanceof Collection) {
        ((Collection<?>) raw).stream().map(String::valueOf).forEach(types::add);
      }
    }

    Response response = new Response(session.getId());
    response.setValue(types.build());
    response.setStatus(ErrorCodes.SUCCESS);
    session.getDownstreamDialect().getResponseCodec().encode(() -> resp, response);
  }
}
