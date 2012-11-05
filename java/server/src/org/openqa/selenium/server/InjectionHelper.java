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


package org.openqa.selenium.server;

import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.IO;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class InjectionHelper {
  static Logger log = Logger.getLogger(InjectionHelper.class.getName());
  private static boolean failOnError = true;
  private static boolean browserSideLogEnabled = true;
  private static boolean INJECT_SCRIPT_TAGS = true;
  private static boolean tryToInjectInHead = false;
  private static String injectionHtml = "/core/scripts/injection.html";
  private static HashMap<String, HashMap<String, String>> jsStateInitializersBySessionId =
      new HashMap<String, HashMap<String, String>>();
  private static HashMap<String, String> sessionIdToUniqueId = new HashMap<String, String>();

  private static HashMap<String, String> contentTransformations = new HashMap<String, String>();
  private static List<String> userJsInjectionFiles = new LinkedList<String>();

  public static void setBrowserSideLogEnabled(boolean browserSideLogEnabled) {
    InjectionHelper.browserSideLogEnabled = browserSideLogEnabled;
  }

  public static void setInjectScriptTags(boolean injectScriptTags) {
    InjectionHelper.INJECT_SCRIPT_TAGS = injectScriptTags;
  }

  public static void setTryToInjectInHead(boolean tryToInjectInHead) {
    InjectionHelper.tryToInjectInHead = tryToInjectInHead;
  }

  public static void setInjectionHtml(String injectionHtml) {
    InjectionHelper.injectionHtml = injectionHtml;
  }

  public static void saveJsStateInitializer(String sessionId, String uniqueId, String jsVarName,
      String jsStateInitializer) {
    // when a new uniqueId is seen for a given sessionId, that means the page has
    // reloaded and the old state should be discarded
    if (sessionIdToUniqueId.containsKey(sessionId) &&
        !sessionIdToUniqueId.get(sessionId).equals(uniqueId)) {
      jsStateInitializersBySessionId.remove(sessionId);
      sessionIdToUniqueId.put(sessionId, uniqueId);
    }
    log.fine("Saving JavaScript state for session " + sessionId + "/" + uniqueId + " " + jsVarName +
        ": " + jsStateInitializer);
    if (!jsStateInitializersBySessionId.containsKey(sessionId)) {
      jsStateInitializersBySessionId.put(sessionId, new HashMap<String, String>());
    }
    HashMap<String, String> h = jsStateInitializersBySessionId.get(sessionId);
    StringBuffer sb = new StringBuffer("if (uniqueId!='");
    sb.append(uniqueId)
        .append("') {")
        .append(jsStateInitializer)
        .append("}");
    h.put(jsVarName, sb.toString());
  }

  public static String restoreJsStateInitializer(String sessionId, String uniqueId) {
    if (!jsStateInitializersBySessionId.containsKey(sessionId)) {
      return "";
    }
    HashMap<String, String> h = jsStateInitializersBySessionId.get(sessionId);
    if (h.isEmpty()) {
      return "";
    }
    StringBuffer sb = new StringBuffer();
    for (Map.Entry<String, String> entry : h.entrySet()) {
      final String jsVarName = entry.getKey();
      final String jsStateInitializer = entry.getValue();
      sb.append(jsStateInitializer)
          .append('\n');
      log.fine("Restoring JavaScript state for session " + sessionId + "/" + uniqueId
          + ": key=" + jsVarName + ": " + jsStateInitializer);
    }
    return sb.toString();
  }

  /**
   * re-read selenium js. Don't maintain it indefinitely for now since then we would need to restart
   * the server to see changes. Once the selenium js is firm, this should change.
   */
  public static void init() {
    String key = "__SELENIUM_JS__";

    StringBuffer sb = new StringBuffer();
    if (!INJECT_SCRIPT_TAGS) { // DGF experiment with using script tags
      try {
        appendFileContent(sb, "/core/scripts/xmlextras.js");
        appendFileContent(sb, "/core/lib/sizzle.js");
        appendFileContent(sb, "/core/scripts/htmlutils.js");
        appendFileContent(sb, "/core/scripts/ui-element.js");
        appendFileContent(sb, "/core/scripts/selenium-browserdetect.js");
        appendFileContent(sb, "/core/scripts/selenium-browserbot.js");
        appendFileContent(sb, "/core/scripts/find_matching_child.js");
        appendFileContent(sb, "/core/scripts/selenium-api.js");
        appendFileContent(sb,
            "/core/scripts/selenium-commandhandlers.js");
        appendFileContent(sb, "/core/scripts/selenium-executionloop.js");
        appendFileContent(sb, "/core/scripts/selenium-remoterunner.js");
        appendFileContent(sb, "/core/scripts/selenium-logging.js");
        appendFileContent(sb, "/core/xpath/util.js");
        appendFileContent(sb, "/core/xpath/xmltoken.js");
        appendFileContent(sb, "/core/xpath/dom.js");
        appendFileContent(sb, "/core/xpath/xpath.js");
        appendFileContent(sb, "/core/xpath/javascript-xpath-0.1.11.js");
        appendFileContent(sb, "/core/scripts/user-extensions.js");
      } catch (Exception e) {
        if (failOnError) {
          throw new RuntimeException(e);
        }
        log.info("failOnError is false, ignoring problems: "
            + e.getMessage());
        log.log(Level.FINE, "Ignored exception", e);
      }
    }
    contentTransformations.put(key, sb.toString());
  }

  private static void writeScriptTags(OutputStream os) throws IOException {
    // DGF script tags are SLOWER than regular injection! (remember, we disable the browser cache
    // entirely)

    writeScriptTag(os, "/core/scripts/xmlextras.js");
    writeScriptTag(os, "/core/lib/sizzle.js");
    writeScriptTag(os, "/core/scripts/atoms.js");
    writeScriptTag(os, "/core/scripts/htmlutils.js");
    writeScriptTag(os, "/core/scripts/ui-element.js");
    writeScriptTag(os, "/core/scripts/selenium-browserdetect.js");
    writeScriptTag(os, "/core/scripts/selenium-browserbot.js");
    writeScriptTag(os, "/core/scripts/find_matching_child.js");
    writeScriptTag(os, "/core/scripts/selenium-api.js");
    writeScriptTag(os, "/core/scripts/selenium-commandhandlers.js");
    writeScriptTag(os, "/core/scripts/selenium-executionloop.js");
    writeScriptTag(os, "/core/scripts/selenium-remoterunner.js");
    writeScriptTag(os, "/core/scripts/selenium-logging.js");
    writeScriptTag(os, "/core/xpath/util.js");
    writeScriptTag(os, "/core/xpath/xmltoken.js");
    writeScriptTag(os, "/core/xpath/dom.js");
    writeScriptTag(os, "/core/xpath/xpath.js");
    writeScriptTag(os, "/core/xpath/javascript-xpath-0.1.11.js");
    writeScriptTag(os, "/core/scripts/user-extensions.js");
  }

  private static void writeScriptTag(OutputStream os, String url) throws IOException {
    os.write("<script type=\"text/javascript\" src=\"/selenium-server".getBytes());
    os.write(url.getBytes());
    os.write("\"></script>\n".getBytes());
  }

  private static void appendFileContent(StringBuffer sb, String url) throws IOException {
    InputStream in = new ClassPathResource(url).getInputStream();
    if (in == null) {
      if (!url.endsWith("user-extensions.js")) {
        throw new RuntimeException("couldn't find " + url);
      }
    } else {
      byte[] buf = new byte[8192];
      while (true) {
        int len = in.read(buf, 0, 8192);
        if (len == -1) {
          break;
        }
        sb.append(new String(buf, 0, len));
      }
    }
  }

  public static long injectJavaScript(HttpRequest request, HttpResponse response, InputStream in,
      OutputStream out, String debugURL) throws IOException {
    if (!contentTransformations.containsKey("__SELENIUM_JS__")) {
      init();
    }

    int len = 102400;
    byte[] buf = new byte[len];
    len = readStream(in, buf, len);
    if (len == -1) {
      return -1;
    }
    int lengthOfBOM = getBOMLength(buf);
    String data = new String(buf, lengthOfBOM, len);

    boolean isKnownToBeHtml =
        HtmlIdentifier.shouldBeInjected(request.getPath(), response.getContentType(), data);

    String url = response.getHttpRequest().getRequestURL().toString();
    if (debugURL.equals(url)) {
      log.info("debug URL seen");
    }

    if (!isKnownToBeHtml) {
      out.write(buf, 0, len);
    }
    // else if (lengthOfBOM>0) {
    // out.write(buf, 0, lengthOfBOM);
    // }
    String sessionId = SessionIdTracker.getLastSessionId();

    long bytesCopied = len;

    log.fine(url + " (InjectionHelper looking)");
    if (!isKnownToBeHtml) {
      bytesCopied += ModifiedIO.copy(in, out);
    } else {
      log.fine("injecting...");
      response.removeField("Content-Length"); // added js will make it wrong, lead to page getting
                                              // truncated
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      if (INJECT_SCRIPT_TAGS) {
        writeScriptTags(baos);
      }
      InputStream jsIn = new ClassPathResource(InjectionHelper.injectionHtml).getInputStream();
      contentTransformations.put("@SESSION_ID@", sessionId);

      writeDataWithUserTransformations("", jsIn, baos);
      jsIn.close();
      baos.write(setSomeJsVars(sessionId));
      for (String filename : userJsInjectionFiles) {
        jsIn = new FileInputStream(filename);
        IO.copy(jsIn, baos);
      }

      int headIndex;
      if (tryToInjectInHead) {
        headIndex = data.toLowerCase().indexOf("<head>");
      } else {
        headIndex = -1;
      }

      if (headIndex != -1) {
        data = data.substring(0, headIndex + 6) + baos.toString() + data.substring(headIndex + 6);
      } else {
        data = baos.toString() + data;
      }

      bytesCopied += writeDataWithUserTransformations(data, in, out);
    }

    return bytesCopied;
  }

  private static int getBOMLength(byte[] buf) {
    if ((buf != null) && (buf.length >= 3) && (buf[0] == (byte) -17) && (buf[1] == (byte) -69) &&
        (buf[2] == (byte) -65)) {
      // jeez, what was that, you may be asking? This comparison is quite wacky. When I look at the
      // same data hexdumped
      // from a file on disk, the bytes are EF BB BF, so I think I could be comparing against 0xef,
      // 0xbb, and 0xbf.
      // But that doesn't work. Here are some interesting evaluations from the Display view in my
      // eclipse:
      //
      // buf[0]
      // (byte) -17
      // buf[1]
      // (byte) -69
      // buf[2]
      // (byte) -65
      // buf[3]
      // (byte) 10
      // (int)(new String(buf)).charAt(0)
      // (int) 239
      // (int)(new String(buf)).charAt(1)
      // (int) 187
      // (int)(new String(buf)).charAt(2)
      // (int) 191
      // (new String(buf)).charAt(2)
      // (char) ¿
      // (int)(new String(buf)).charAt(3)
      // (int) 10
      //
      // what I would really like would be to recognize any BOM (cf
      // http://en.wikipedia.org/wiki/Byte_Order_Mark). I could easily set up
      // the appropriate comparisons if I knew how to translate from the hex form to some
      // appropriate analogue for a Java comparison.
      return 3;
    }
    return 0; // there was no BOM
  }

  /**
   * read bufLen bytes into buf (unless EOF is seen first) from in.
   * 
   * @param in
   * @param buf
   * @param bufLen
   * @return number of bytes read
   * @throws IOException
   */
  private static int readStream(InputStream in, byte[] buf, int bufLen) throws IOException {
    int offset = 0;
    do {
      int bytesRead = in.read(buf, offset, bufLen - offset);
      if (bytesRead == -1) {
        break;
      }
      offset += bytesRead;
    } while (offset < bufLen);
    int bytesReadTotal = offset;
    return bytesReadTotal;
  }

  private static long writeDataWithUserTransformations(String data, InputStream in, OutputStream out)
      throws IOException {
    long bytesWritten = 0;
    byte[] buf = new byte[8192];
    while (true) {
      for (String beforeRegexp : contentTransformations.keySet()) {
        String after = contentTransformations.get(beforeRegexp);
        if (after == null) {
          log.warning("no transformation seen for key " + beforeRegexp);
        } else {
          try {
            data = data.replaceAll(beforeRegexp, after);
          } catch (IllegalArgumentException e) {
            // bad regexp or bad back ref in the 'after'.
            // Do a straight substitution instead.
            // (This logic needed for injection.html's __SELENIUM_JS__
            // replacement to work.)
            data = data.replace(beforeRegexp, after);
          }
        }
      }
      out.write(data.getBytes());
      int len = in.read(buf);
      if (len == -1) {
        break;
      }
      bytesWritten += len;
      data = new String(buf, 0, len);
    }

    return bytesWritten;
  }

  private static byte[] setSomeJsVars(String sessionId) {
    StringBuffer moreJs = new StringBuffer();
    if (InjectionHelper.browserSideLogEnabled) {
      moreJs.append("debugMode = true;\n");
    }
    moreJs.append("injectedSessionId = \"")
        .append(sessionId)
        .append("\";\n");
    return makeJsChunk(moreJs.toString());
  }

  // This logic may be useful on some browsers which don't support load listeners.
  // private static String usurpOnUnloadHook(String data, String string) {
  // Pattern framesetAreaRegexp = Pattern.compile("(<\\s*frameset.*?>)", Pattern.CASE_INSENSITIVE);
  // Matcher framesetMatcher = framesetAreaRegexp.matcher(data);
  // if (!framesetMatcher.find()) {
  // System.out.println("WARNING: looked like a frameset, but couldn't retrieve the frameset area");
  // return data;
  // }
  // String onloadRoutine = "selenium_frameRunTest()";
  // String frameSetText = framesetMatcher.group(1);
  // Pattern onloadRegexp = Pattern.compile("onload='(.*?)'", Pattern.CASE_INSENSITIVE);
  // Matcher onloadMatcher = onloadRegexp.matcher(frameSetText);
  // if (!onloadMatcher.find()) {
  // onloadRegexp = Pattern.compile("onload=\"(.*?)\"", Pattern.CASE_INSENSITIVE); // try double
  // quotes
  // onloadMatcher = onloadRegexp.matcher(frameSetText);
  // }
  // if (onloadMatcher.find()) {
  // String oldOnloadRoutine = onloadMatcher.group(1);
  // frameSetText = onloadMatcher.replaceFirst("");
  // String escapedOldOnloadRoutine = null;
  // try {
  // escapedOldOnloadRoutine = URLEncoder.encode(oldOnloadRoutine, "UTF-8");
  // } catch (UnsupportedEncodingException e) {
  // throw new RuntimeException("could not handle " + oldOnloadRoutine + ": " + e);
  // }
  // onloadRoutine = "selenium_frameRunTest(unescape('" + escapedOldOnloadRoutine + "'))";
  // }
  //
  // // either there was no existing onload, or it's been stripped out
  // Pattern framesetTagRegexp = Pattern.compile("<\\s*frameset", Pattern.CASE_INSENSITIVE);
  // frameSetText = framesetTagRegexp.matcher(frameSetText).replaceFirst("<frameset onload=\"" +
  // onloadRoutine + "\"");
  // data = framesetMatcher.replaceFirst(frameSetText);
  // return data;
  // }

  private static byte[] makeJsChunk(String js) {
    StringBuffer sb = new StringBuffer("\n<script language=\"JavaScript\">\n");
    sb.append(js)
        .append("\n</script>\n");
    return sb.toString().getBytes();
  }

  public static boolean addUserContentTransformation(String before, String after) {
    contentTransformations.put(before, after);
    return true;
  }

  public static boolean addUserJsInjectionFile(String fileName) {
    File f = new File(fileName);
    if (!f.canRead()) {
      log.severe("cannot read user JavaScript injection file " + fileName);
      return false;
    }
    userJsInjectionFiles.add(fileName);
    return true;
  }

  public static boolean userContentTransformationsExist() {
    return !contentTransformations.isEmpty();
  }

  public static boolean userJsInjectionsExist() {
    return !userJsInjectionFiles.isEmpty();
  }

  public static boolean isFailOnError() {
    return failOnError;
  }

  public static void setFailOnError(boolean failOnError) {
    InjectionHelper.failOnError = failOnError;
  }
}
