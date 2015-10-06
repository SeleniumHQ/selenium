package org.openqa.selenium.remote.server;

import com.beust.jcommander.Parameter;

/**
 * Command line args for the selenium server.
 */
public class CommandLineArgs {
  @Parameter(
    names = {"--help", "-help", "-h"},
    help = true,
    hidden = true,
    description = "This help.")
  boolean help;

  @Parameter(
    names = "-browserTimeout",
    description = "Number of seconds a browser is allowed to hang (0 means indefinite).")
  int browserTimeout;

  @Parameter(
    names = "-jettyThreads",
    hidden = true)
  int jettyThreads;

  @Parameter(
    names = {"-port"},
    description = "The port number the selenium server should use.")
  int port = 4444;

  @Parameter(
    names = "-timeout",
    description = "Number of seconds we should allow a client to be idle (0 means indefinite).")
  int timeout;
}
