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

/*
 * HtmlIdentifier: a module to identify HTML (and in so doing determine whether it should be
 * injected with selenium JavaScript when running in proxy injection mode).
 * 
 * As content arrives from the web server, the selenium server must decide whether it is appropriate
 * to inject the selenium test harness JavaScript into that content.  It determines this by means of
 * logic in HtmlIdentifier, a module Patrick recently added.  This module looks at the suffix (e.g.,
 * .html, .js, etc.), the HTTP content type header field, and the content itself (e.g., it
 * asks questions like 'does it contain "<html>"?').  It applies a series of rules which are used
 * to derive an integer score indicating whether injection is a good idea.
 * 
 * So if you find that proxy injection mode is inappropriately injecting JavaScript into content, or
 * not injecting JavaScript into content which needs it, then it is likely that HtmlIdentifier's rules
 * need to be adjusted.  First, you can diagnose the logic by running the selenium server in
 * debug mode, and looking at the logger output.  In this output you can see how any particular
 * content's score was arrived at.  For example:
 * 
 * HtmlIdentifier.shouldBeInjected("http://www.google.com/webhp", "text/html; charset=UTF-8", "...")
 *   applied rule [extension [html, htm] rule: match=10000]: 0
 *   applied rule [extension [jsp, asp, php, pl] rule: match=100]: 0
 *   applied rule [extension [dll, gif, ico, jpg, jpeg, png, dwr, js] rule: match=-1000]: 0
 *   applied rule [content <html rule: match=1000, failure to match -> -100]: 1000
 *   applied rule [content <!DOCTYPE html rule: match=1000, failure to match -> -100]: -100
 *   applied rule [content type text/html rule: match=100, failure to match -> -1000]: 100
 *   applied rule [dojo catcher rule: match=-100000]: 0
 *   total : 1000 (should inject)
 * 
 * If you find a case where an incorrect decision is being made, then
 * 
 * 1. add a test case to the HtmlIdentifierTest module to reproduce the problem
 * 2. add rules or adjust HtmlIdentifier's logic to fix the problem
 * 3. run all the tests to be sure that we haven't regressed in scenarios other than your own
 * 4. check it in
 */

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

public class HtmlIdentifier {
  static Logger log = Logger.getLogger(HtmlIdentifier.class.getName());
  private static List<Rule> rules = new ArrayList<Rule>();
  private static final int INJECTION_THRESHOLD = 200;

  static {
    rules.add(new ExtensionRule(new String[] {"html", "htm"}, 10000));
    rules.add(new ExtensionRule(new String[] {"jsp", "asp", "php", "pl"}, 100));
    // ebay dll contains HTML snippets which fool InjectionHelper. -nas
    rules.add(new ExtensionRule(new String[] {"dll", "js"}, -1000));
    rules.add(new ExtensionRule(new String[] {"gif", "ico", "jpg", "jpeg", "png", "dwr", "swf"},
        -10000));
    rules.add(new ContentRule("<html", 1000, -100));
    rules.add(new ContentRule("<head", 500, -100)); // http://drudgereport.com doesn't have <html>,
                                                    // but rather starts with <head>
    rules.add(new ContentRule("<!DOCTYPE html", 1000, -100));
    rules.add(new ContentTypeRule("text/html", 100, -1000));
    rules.add(new ContentTypeRule("application/java-archive", -20000, 0)); // jars are zips, often
                                                                           // containing <html>
                                                                           // fragments
    rules.add(new Rule("dojo catcher", -100000, 0) {
      @Override
      public int score(String path, String contentType, String contentPreview) {

        if (path == null) {
          return 0;
        }

        // dojo should never be processed
        if (path.contains("/dojo/")) {
          return -100000;
        }

        return 0;
      }
    });
  }

  public static boolean shouldBeInjected(String path, String contentType, String contentPreview) {
    int score = 0;

    log.fine("shouldBeInjected(\"" + path + "\", \"" + contentType + "\", \"...\")");

    for (Rule rule : rules) {
      int scoreDelta = rule.score(path, contentType, contentPreview);
      log.fine("    applied rule " + rule + ": " + scoreDelta);
      score += scoreDelta;
    }
    boolean shouldInject = (score > INJECTION_THRESHOLD);
    log.fine("    total : " + score + ">" + INJECTION_THRESHOLD + "?  (should " +
        (shouldInject ? "" : "not ") + "inject)");
    return shouldInject;
  }

  static abstract class Rule {
    protected final int missingScore;
    protected final int score;
    protected String name;

    public Rule(String name, int score, int missingScore) {
      this.name = name;
      this.score = score;
      this.missingScore = missingScore;
    }

    abstract int score(String path, String contentType, String contentPreview);

    @Override
    public String toString() {
      return "[" + name + " rule: match=" + score +
          (missingScore == 0 ? "" : (", failure to match -> " + missingScore))
          + "]";
    }
  }

  static class ExtensionRule extends Rule {
    List<String> exts = new ArrayList<String>();

    public ExtensionRule(String ext, int score) {
      super("extension " + ext, score, 0);
      exts.add(ext);
    }

    public ExtensionRule(String[] ext, int score) {
      super(null, score, 0);
      for (String s : ext) {
        exts.add(s);
      }
      name = "extension " + exts;
    }

    @Override
    public int score(String path, String contentType, String contentPreview) {
      if (path == null || !path.contains(".")) {
        return 0;
      }

      for (String ext : exts) {
        if (path.endsWith("." + ext)) {
          return score;
        }
      }

      return 0;
    }
  }

  static class ContentRule extends Rule {
    String contentInLowerCase;

    public ContentRule(String content, int score, int missingScore) {
      super("content " + content, score, missingScore);
      this.contentInLowerCase = content.toLowerCase();
    }

    @Override
    public int score(String path, String contentType, String contentPreview) {
      if (contentPreview == null) {
        return 0;
      }

      if (contentPreview.toLowerCase().contains(contentInLowerCase)) {
        return score;
      }
      return missingScore;
    }
  }

  static class ContentTypeRule extends Rule {
    String type;

    public ContentTypeRule(String type, int score, int missingScore) {
      super("content type " + type, score, missingScore);
      this.type = type;
    }

    @Override
    public int score(String path, String contentType, String contentPreview) {
      if (contentType == null) {
        return 0;
      }

      if (contentType.contains(type)) {
        return score;
      }
      return missingScore;
    }
  }

}
