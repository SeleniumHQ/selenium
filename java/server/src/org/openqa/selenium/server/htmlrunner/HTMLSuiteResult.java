// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.server.htmlrunner;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

import javax.swing.text.MutableAttributeSet;
import javax.swing.text.html.HTML;
import javax.swing.text.html.HTML.Tag;
import javax.swing.text.html.HTMLDocument;
import javax.swing.text.html.HTMLEditorKit;
import javax.swing.text.html.HTMLEditorKit.Parser;
import javax.swing.text.html.HTMLEditorKit.ParserCallback;

public class HTMLSuiteResult {

  // private final String originalSuite;
  private final String updatedSuite;
  private final List<String> hrefs;

  public HTMLSuiteResult(String originalSuite) {
    // this.originalSuite = originalSuite;
    StringReader s = new StringReader(originalSuite);
    HTMLEditorKit k = new HTMLEditorKit();
    HTMLDocument doc = (HTMLDocument) k.createDefaultDocument();
    Parser parser = doc.getParser();
    HrefConverter p = new HrefConverter();
    doc.setAsynchronousLoadPriority(-1);
    try {
      parser.parse(s, p, true);
    } catch (IOException e) {
      // DGF aw, this won't really happen! (will it?)
      throw new RuntimeException(e);
    }
    hrefs = p.hrefList;
    StringBuilder sb = new StringBuilder();
    int previousPosition = originalSuite.length();
    for (int i = p.tagPositions.size() - 1; i >= 0; i--) {
      int pos = p.tagPositions.get(i);
      String href = p.hrefList.get(i);
      System.out.println(href);
      String snippet = originalSuite.substring(pos, previousPosition).replace('\\', '/');
      System.out.println(snippet);
      String replaceSnippet = snippet.replaceFirst("\\Q" + href + "\\E", "#testresult" + i);
      sb.insert(0, replaceSnippet);
      previousPosition = pos;
    }
    String snippet = originalSuite.substring(0, previousPosition);
    sb.insert(0, snippet);
    updatedSuite = sb.toString();
  }

  public List<String> getHrefs() {
    return this.hrefs;
  }

  public String getHref(int i) {
    if (i >= hrefs.size()) return "";
    return hrefs.get(i);
  }

  public String getUpdatedSuite() {
    return this.updatedSuite;
  }

  private static class HrefConverter extends ParserCallback {
    public final List<String> hrefList = new ArrayList<>();
    public final List<Integer> tagPositions = new ArrayList<>();

    @Override
    public void handleStartTag(Tag tag, MutableAttributeSet attributes, int pos) {
      if (Tag.A.equals(tag)) {
        String href = (String) attributes.getAttribute(HTML.Attribute.HREF);
        hrefList.add(href.replace('\\', '/'));
        tagPositions.add(pos);
      }
    }
  }

}
