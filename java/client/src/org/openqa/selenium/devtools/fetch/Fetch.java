package org.openqa.selenium.devtools.fetch;

import com.google.common.collect.ImmutableMap;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.fetch.model.HeaderEntry;
import org.openqa.selenium.devtools.fetch.model.RequestId;
import org.openqa.selenium.devtools.fetch.model.RequestPattern;
import org.openqa.selenium.devtools.fetch.model.RequestPaused;
import org.openqa.selenium.devtools.network.model.ErrorReason;

import java.util.List;
import java.util.Optional;

public class Fetch {

  public static Command<Void> disable() {
    return new Command<>("Fetch.disable", ImmutableMap.of());
  }

  public static Command<Void> enable(
    Optional<List<RequestPattern>> requestPatterns,
    Optional<Boolean> handleAuthRequests) {

    ImmutableMap.Builder<String, Object> args = ImmutableMap.builder();
    requestPatterns.ifPresent(patterns -> args.put("patterns", patterns));
    handleAuthRequests.ifPresent(authRequests -> args.put("handleAuthRequests", authRequests));

    return new Command<>("Fetch.enable", args.build());
  }

  public static Command<Void> failRequest(RequestId requestId, ErrorReason errorReason) {
    return new Command<Void>(
      "Fetch.failRequest",
      ImmutableMap.of("requestId", requestId, "errorReason", errorReason))
      .doesNotSendResponse();
  }

  public static Command<Void> fulfillRequest(
    RequestId requestId,
    int responseCode,
    List<HeaderEntry> responseHeaders,
    Optional<String> body,
    Optional<String> responsePhrase) {

    ImmutableMap.Builder<String, Object> args = ImmutableMap.builder();
    args.put("requestId", requestId);
    args.put("responseCode", responseCode);
    args.put("responseHeaders", responseHeaders);
    body.ifPresent(text -> args.put("body", text));
    responsePhrase.ifPresent(phrase -> args.put("responsePhrase", phrase));

    return new Command<Void>("Fetch.fulfillRequest", args.build()).doesNotSendResponse();
  }

  public static Command<Void> continueRequest(
    RequestId requestId,
    Optional<String> url,
    Optional<String> method,
    Optional<String> postData,
    Optional<List<HeaderEntry>> headers) {

    ImmutableMap.Builder<String, Object> args = ImmutableMap.builder();
    args.put("requestId", requestId);
    url.ifPresent(u -> args.put("url", u));
    method.ifPresent(m -> args.put("method", m));
    postData.ifPresent(data -> args.put("postData", data));
    headers.ifPresent(h -> args.put("headers", headers));

    return new Command<Void>("Fetch.continueRequest", args.build()).doesNotSendResponse();
  }

  public static Event<RequestPaused> requestPaused() {
    return new Event<>("Fetch.requestPaused", input -> input.read(RequestPaused.class));
  }
}
