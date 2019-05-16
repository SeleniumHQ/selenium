package org.openqa.selenium.devtools.network.model;

/**
 * Stages of the interception to begin intercepting.
 * Request will intercept before the request is sent. Response will intercept after the response is received
 */
public enum InterceptionStage {
  Request,
  HeadersReceived
}
