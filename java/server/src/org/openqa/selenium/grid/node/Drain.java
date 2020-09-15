package org.openqa.selenium.grid.node;

import static java.net.HttpURLConnection.HTTP_INTERNAL_ERROR;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.remote.http.Contents.utf8String;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.UncheckedIOException;
import java.util.Objects;

public class Drain implements HttpHandler {

  private final Node node;
  private final Json json;

  public Drain(Node node, Json json) {
    this.node = Objects.requireNonNull(node);
    this.json = Objects.requireNonNull(json);
  }

  @Override
  public HttpResponse execute(HttpRequest req) throws UncheckedIOException {
    this.node.drain();

    HttpResponse response = new HttpResponse();

    if(this.node.isDraining()) {
      response.setStatus(HTTP_OK);
    }
    else
    {
      response.setStatus(HTTP_INTERNAL_ERROR);
    }

    return response;
  }
}
