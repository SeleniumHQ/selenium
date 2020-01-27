package org.openqa.selenium.remote;

import io.opentelemetry.trace.Span;
import org.openqa.selenium.Capabilities;

import java.util.function.BiConsumer;

public class RemoteTags {

  private RemoteTags() {
    // Utility class
  }

  public static BiConsumer<Span, Capabilities> CAPABILITIES = (span, caps) -> {
    span.setAttribute("session.capabilities", String.valueOf(caps));
  };

  public static BiConsumer<Span, SessionId> SESSION_ID = (span, id) -> {
    span.setAttribute("session.id", String.valueOf(id));
  };

}
