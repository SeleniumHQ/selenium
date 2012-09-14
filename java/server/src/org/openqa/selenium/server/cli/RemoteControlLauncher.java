/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


package org.openqa.selenium.server.cli;

import org.openqa.selenium.server.InjectionHelper;
import org.openqa.selenium.server.RemoteControlConfiguration;

import java.io.File;

/**
 * Parse Remote Control Launcher Options
 */
public class RemoteControlLauncher {

  public static void usage(String msg) {
    if (msg != null) {
      System.err.println(msg + ":");
    }
    String INDENT = "  ";
    String INDENT2X = INDENT + INDENT;
    printWrappedErrorLine("", "Usage: java -jar selenium-server.jar [-interactive] [options]\n");
    printWrappedErrorLine(INDENT,
        "-port <nnnn>: the port number the selenium server should use (default 4444)");
    printWrappedErrorLine(INDENT,
        "-timeout <nnnn>: an integer number of seconds we should allow a client to be idle");
    printWrappedErrorLine(INDENT,
        "-browserTimeout <nnnn>: an integer number of seconds a browser is allowed to hang");
    printWrappedErrorLine(INDENT,
        "-interactive: puts you into interactive mode.  See the tutorial for more details");
    printWrappedErrorLine(
        INDENT,
        "-singleWindow: puts you into a mode where the test web site executes in a frame. This mode should only be selected if the application under test does not use frames.");
    printWrappedErrorLine(
        INDENT,
        "-profilesLocation: Specifies the directory that holds the profiles that java clients can use to start up selenium.  Currently supported for Firefox only.");
    printWrappedErrorLine(
        INDENT,
        "-forcedBrowserMode <browser>: sets the browser mode to a single argument (e.g. \"*iexplore\") for all sessions, no matter what is passed to getNewBrowserSession");


    printWrappedErrorLine(
        INDENT,
        "-forcedBrowserModeRestOfLine <browser>: sets the browser mode to all the remaining tokens on the line (e.g. \"*custom /some/random/place/iexplore.exe\") for all sessions, no matter what is passed to getNewBrowserSession");
    printWrappedErrorLine(INDENT,
        "-userExtensions <file>: indicates a JavaScript file that will be loaded into selenium");
    printWrappedErrorLine(INDENT,
        "-browserSessionReuse: stops re-initialization and spawning of the browser between tests");
    printWrappedErrorLine(
        INDENT,
        "-avoidProxy: By default, we proxy every browser request; set this flag to make the browser use our proxy only for URLs containing '/selenium-server'");
    printWrappedErrorLine(
        INDENT,
        "-firefoxProfileTemplate <dir>: normally, we generate a fresh empty Firefox profile every time we launch.  You can specify a directory to make us copy your profile directory instead.");
    printWrappedErrorLine(INDENT,
        "-debug: puts you into debug mode, with more trace information and diagnostics on the console");
    printWrappedErrorLine(
        INDENT,
        "-browserSideLog: enables logging on the browser side; logging messages will be transmitted to the server.  This can affect performance.");
    printWrappedErrorLine(
        INDENT,
        "-ensureCleanSession: If the browser does not have user profiles, make sure every new session has no artifacts from previous sessions.  For example, enabling this option will cause all user cookies to be archived before launching IE, and restored after IE is closed.");
    printWrappedErrorLine(
        INDENT,
        "-trustAllSSLCertificates: Forces the Selenium proxy to trust all SSL certificates.  This doesn't work in browsers that don't use the Selenium proxy.");
    printWrappedErrorLine(INDENT,
        "-log <logFileName>: writes lots of debug information out to a log file");
    printWrappedErrorLine(
        INDENT,
        "-htmlSuite <browser> <startURL> <suiteFile> <resultFile>: Run a single HTML Selenese (Selenium Core) suite and then exit immediately, using the specified browser (e.g. \"*firefox\") on the specified URL (e.g. \"http://www.google.com\").  You need to specify the absolute path to the HTML test suite as well as the path to the HTML results file we'll generate.");
    printWrappedErrorLine(
        INDENT,
        "-proxyInjectionMode: puts you into proxy injection mode, a mode where the selenium server acts as a proxy server "
            +
            "for all content going to the test application.  Under this mode, multiple domains can be visited, and the "
            +
            "following additional flags are supported:\n");
    printWrappedErrorLine(
        INDENT2X,
        "-dontInjectRegex <regex>: an optional regular expression that proxy injection mode can use to know when to bypss injection");
    printWrappedErrorLine(INDENT2X,
        "-userJsInjection <file>: specifies a JavaScript file which will then be injected into all pages");
    printWrappedErrorLine(
        INDENT2X,
        "-userContentTransformation <regex> <replacement>: a regular expression which is matched "
            +
            "against all test HTML content; the second is a string which will replace matches.  These flags can be used any "
            +
            "number of times.  A simple example of how this could be useful: if you add \"-userContentTransformation https http\" "
            +
            "then all \"https\" strings in the HTML of the test application will be changed to be \"http\".");
  }

  public static RemoteControlConfiguration parseLauncherOptions(String[] args) {
    RemoteControlConfiguration configuration;
    configuration = new RemoteControlConfiguration();
    configuration.setPort(RemoteControlConfiguration.getDefaultPort());
    for (int i = 0; i < args.length; i++) {
      String arg = args[i];
      if ("-h".equalsIgnoreCase(arg) || "-help".equalsIgnoreCase(arg)) {
        usage(null);
        System.exit(1);
      } else if ("-defaultBrowserString".equalsIgnoreCase(arg)) {
        usage("-defaultBrowserString has been renamed -forcedBrowserMode");
      } else if ("-forcedBrowserMode".equalsIgnoreCase(arg)) {
        configuration.setForcedBrowserMode(getArg(args, ++i));
        if (i < args.length) {
          System.err
              .println("Warning: -forcedBrowserMode no longer consumes all remaining arguments on line (use -forcedBrowserModeRestOfLine for that)");
        }
      } else if ("-forcedBrowserModeRestOfLine".equalsIgnoreCase(arg)) {
        for (i++; i < args.length; i++) {
          if (null == configuration.getForcedBrowserMode()) {
            configuration.setForcedBrowserMode("");
          } else {
            configuration.setForcedBrowserMode(configuration.getForcedBrowserMode() + " ");
          }
          configuration.setForcedBrowserMode(configuration.getForcedBrowserMode() + args[i]);
        }
      } else if ("-log".equalsIgnoreCase(arg)) {
        configuration.setLogOutFileName(getArg(args, ++i));
      } else if ("-captureLogsOnQuit".equalsIgnoreCase(arg)) {
        configuration.setCaptureLogsOnQuit(true);
      } else if ("-port".equalsIgnoreCase(arg)) {
        configuration.setPort(Integer.parseInt(getArg(args, ++i)));
      } else if ("-multiWindow".equalsIgnoreCase(arg)) {
        configuration.setSingleWindow(!true);
      } else if ("-singleWindow".equalsIgnoreCase(arg)) {
        configuration.setSingleWindow(!false);
      } else if ("-profilesLocation".equalsIgnoreCase(arg)) {
        File profilesLocation = new File(getArg(args, ++i));
        if (!profilesLocation.exists()) {
          System.err.println("Specified profile location directory does not exist: " +
              profilesLocation);
          System.exit(1);
        }
        configuration.setProfilesLocation(profilesLocation);
      } else if ("-avoidProxy".equalsIgnoreCase(arg)) {
        configuration.setAvoidProxy(true);
      } else if ("-proxyInjectionMode".equalsIgnoreCase(arg)) {
        configuration.setProxyInjectionModeArg(true);
        // proxyInjectionMode implies singleWindow mode
        configuration.setSingleWindow(!false);
      } else if ("-portDriversShouldContact".equalsIgnoreCase(arg)) {
        // to facilitate tcptrace interception of interaction between
        // injected js and the selenium server
        configuration.setPortDriversShouldContact(Integer.parseInt(getArg(args, ++i)));
      } else if ("-noBrowserSessionReuse".equalsIgnoreCase(arg)) {
        configuration.setReuseBrowserSessions(false);
      } else if ("-browserSessionReuse".equalsIgnoreCase(arg)) {
        configuration.setReuseBrowserSessions(true);
      } else if ("-firefoxProfileTemplate".equalsIgnoreCase(arg)) {
        configuration.setFirefoxProfileTemplate(new File(getArg(args, ++i)));
        if (!configuration.getFirefoxProfileTemplate().exists()) {
          System.err.println("Firefox profile template doesn't exist: " +
              configuration.getFirefoxProfileTemplate().getAbsolutePath());
          System.exit(1);
        }
      } else if ("-ensureCleanSession".equalsIgnoreCase(arg)) {
        configuration.setEnsureCleanSession(true);
      } else if ("-dontInjectRegex".equalsIgnoreCase(arg)) {
        configuration.setDontInjectRegex(getArg(args, ++i));
      } else if ("-browserSideLog".equalsIgnoreCase(arg)) {
        configuration.setBrowserSideLogEnabled(true);
      } else if ("-debug".equalsIgnoreCase(arg)) {
        configuration.setDebugMode(true);
      } else if ("-debugURL".equalsIgnoreCase(arg)) {
        configuration.setDebugURL(getArg(args, ++i));
      } else if ("-timeout".equalsIgnoreCase(arg)) {
        configuration.setTimeoutInSeconds(Integer.parseInt(getArg(args, ++i)));
      } else if ("-jettyThreads".equalsIgnoreCase(arg)) {
        int jettyThreadsCount = Integer.parseInt(getArg(args, ++i));

        // Set the number of jetty threads before we construct the instance
        configuration.setJettyThreads(jettyThreadsCount);
      } else if ("-trustAllSSLCertificates".equalsIgnoreCase(arg)) {
        configuration.setTrustAllSSLCertificates(true);
      } else if ("-userJsInjection".equalsIgnoreCase(arg)) {
        configuration.setUserJSInjection(true);
        if (!InjectionHelper.addUserJsInjectionFile(getArg(args, ++i))) {
          usage(null);
          System.exit(1);
        }
      } else if ("-userContentTransformation".equalsIgnoreCase(arg)) {
        if (!InjectionHelper.addUserContentTransformation(getArg(args, ++i), getArg(args, ++i))) {
          usage(null);
          System.exit(1);
        }
      } else if ("-userExtensions".equalsIgnoreCase(arg)) {
        configuration.setUserExtensions(new File(getArg(args, ++i)));
        if (!configuration.getUserExtensions().exists()) {
          System.err.println("User Extensions file doesn't exist: " +
              configuration.getUserExtensions().getAbsolutePath());
          System.exit(1);
        }
        if (!"user-extensions.js".equalsIgnoreCase(configuration.getUserExtensions().getName())) {
          System.err.println("User extensions file MUST be called \"user-extensions.js\": " +
              configuration.getUserExtensions().getAbsolutePath());
          System.exit(1);
        }
      } else if ("-selfTest".equalsIgnoreCase(arg)) {
        configuration.setSelfTest(true);
        configuration.setSelfTestDir(new File(getArg(args, ++i)));
        configuration.getSelfTestDir().mkdirs();
      } else if ("-htmlSuite".equalsIgnoreCase(arg)) {
        try {
          System.setProperty("htmlSuite.browserString", args[++i]);
          System.setProperty("htmlSuite.startURL", args[++i]);
          System.setProperty("htmlSuite.suiteFilePath", args[++i]);
          System.setProperty("htmlSuite.resultFilePath", args[++i]);
        } catch (ArrayIndexOutOfBoundsException e) {
          System.err.println("Not enough command line arguments for -htmlSuite");
          System.err.println("-htmlSuite requires you to specify:");
          System.err.println("* browserString (e.g. \"*firefox\")");
          System.err.println("* startURL (e.g. \"http://www.google.com\")");
          System.err.println("* suiteFile (e.g. \"c:\\absolute\\path\\to\\my\\HTMLSuite.html\")");
          System.err.println("* resultFile (e.g. \"c:\\absolute\\path\\to\\my\\results.html\")");
          System.exit(1);
        }
        configuration.setHTMLSuite(true);
      } else if ("-interactive".equalsIgnoreCase(arg)) {
        configuration.setTimeoutInSeconds(Integer.MAX_VALUE);
        configuration.setInteractive(true);
      } else if ("-honor-system-proxy".equals(arg)) {
        configuration.setHonorSystemProxy(true);
      } else if (arg.startsWith("-D")) {
        setSystemProperty(arg);
      } /*
         * else { usage("unrecognized argument " + arg); System.exit(1); }
         */
    }
    if (configuration.userJSInjection() && !configuration.getProxyInjectionModeArg()) {
      System.err.println("User js injection can only be used w/ -proxyInjectionMode");
      System.exit(1);
    }
    if (configuration.getProfilesLocation() != null &&
        configuration.getFirefoxProfileTemplate() != null) {
      System.err.println("Cannot specify both a profileDirectory and a firefoxProfileTemplate");
      System.exit(1);
    }

    if (null == configuration.getForcedBrowserMode()) {
      if (null != System.getProperty("selenium.defaultBrowserString")) {
        System.err
            .println("The selenium.defaultBrowserString property is no longer supported; use selenium.forcedBrowserMode instead.");
        System.exit(-1);
      }
      configuration.setForcedBrowserMode(System.getProperty("selenium.forcedBrowserMode"));
    }

    if (!configuration.getProxyInjectionModeArg() &&
        System.getProperty("selenium.proxyInjectionMode") != null) {
      configuration.setProxyInjectionModeArg("true".equals(System
          .getProperty("selenium.proxyInjectionMode")));
    }
    if (!configuration.isBrowserSideLogEnabled() &&
        System.getProperty("selenium.browserSideLog") != null) {
      configuration.setBrowserSideLogEnabled("true".equals(System
          .getProperty("selenium.browserSideLog")));
    }

    if (!configuration.isDebugMode() && System.getProperty("selenium.debugMode") != null) {
      configuration.setDebugMode("true".equals(System.getProperty("selenium.debugMode")));
    }
    return configuration;
  }

  public static String getArg(String[] args, int i) {
    if (i >= args.length) {
      usage("expected at least one more argument");
      System.exit(-1);
    }
    return args[i];
  }

  public static void printWrappedErrorLine(String prefix, String msg) {
    printWrappedErrorLine(prefix, msg, true);
  }

  public static void printWrappedErrorLine(String prefix, String msg, boolean first) {
    System.err.print(prefix);
    if (!first) {
      System.err.print("  ");
    }
    int defaultWrap = 70;
    int wrap = defaultWrap - prefix.length();
    if (wrap > msg.length()) {
      System.err.println(msg);
      return;
    }
    String lineRaw = msg.substring(0, wrap);
    int spaceIndex = lineRaw.lastIndexOf(' ');
    if (spaceIndex == -1) {
      spaceIndex = lineRaw.length();
    }
    String line = lineRaw.substring(0, spaceIndex);
    System.err.println(line);
    printWrappedErrorLine(prefix, msg.substring(spaceIndex + 1), false);
  }

  public static void setSystemProperty(String arg) {
    if (arg.indexOf('=') == -1) {
      usage("poorly formatted Java property setting (I expect to see '=') " + arg);
      System.exit(1);
    }
    String property = arg.replaceFirst("-D", "").replaceFirst("=.*", "");
    String value = arg.replaceFirst("[^=]*=", "");
    System.err.println("Setting system property " + property + " to " + value);
    System.setProperty(property, value);
  }

}
