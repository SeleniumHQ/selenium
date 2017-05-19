package org.openqa.selenium.remote.server;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

interface SessionCodec {
  void handle(HttpServletRequest req, HttpServletResponse resp) throws IOException;
}
