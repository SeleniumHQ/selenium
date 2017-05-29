package org.openqa.selenium.remote.server.rest;

import com.google.common.base.Optional;
import com.google.gson.JsonObject;

import org.openqa.selenium.remote.BeanToJsonConverter;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

/**
 * Contains factory methods for creating {@link org.openqa.selenium.remote.Response} objects.
 */
class Responses {

  private static final ErrorCodes ERROR_CODES = new ErrorCodes();

  private Responses() {}  // Utility class.

  /**
   * Creates a response object for a successful command execution.
   *
   * @param sessionId ID of the session that executed the command.
   * @param value the command result value.
   * @return the new response object.
   */
  public static Response success(SessionId sessionId, Object value) {
    Response response = new Response();
    response.setSessionId(sessionId != null ? sessionId.toString() : null);
    response.setValue(value);
    response.setStatus(ErrorCodes.SUCCESS);
    response.setState(ErrorCodes.SUCCESS_STRING);
    return response;
  }

  /**
   * Creates a response object for a failed command execution.
   *
   * @param sessionId ID of the session that executed the command.
   * @param reason the failure reason.
   * @return the new response object.
   */
  public static Response failure(SessionId sessionId, Throwable reason) {
    Response response = new Response();
    response.setSessionId(sessionId != null ? sessionId.toString() : null);
    response.setValue(reason);
    response.setStatus(ERROR_CODES.toStatusCode(reason));
    response.setState(ERROR_CODES.toState(response.getStatus()));
    return response;
  }

  /**
   * Creates a response object for a failed command execution.
   *
   * @param sessionId ID of the session that executed the command.
   * @param reason the failure reason.
   * @param screenshot a base64 png screenshot to include with the failure.
   * @return the new response object.
   */
  public static Response failure(
      SessionId sessionId, Throwable reason, Optional<String> screenshot) {
    Response response = new Response();
    response.setSessionId(sessionId != null ? sessionId.toString() : null);
    response.setStatus(ERROR_CODES.toStatusCode(reason));
    response.setState(ERROR_CODES.toState(response.getStatus()));

    if (reason != null) {
      JsonObject json = new BeanToJsonConverter().convertObject(reason).getAsJsonObject();
      json.addProperty("screen", screenshot.orNull());
      response.setValue(json);
    }
    return response;
  }
}
