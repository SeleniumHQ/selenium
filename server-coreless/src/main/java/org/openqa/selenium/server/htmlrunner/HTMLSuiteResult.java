/*
 * Created on Oct 12, 2006
 *
 */
package org.openqa.selenium.server.htmlrunner;

import java.io.*;
import java.util.*;

import javax.swing.text.*;
import javax.swing.text.html.*;
import javax.swing.text.html.HTML.*;
import javax.swing.text.html.HTMLEditorKit.*;

public class HTMLSuiteResult {

    //private final String originalSuite;
    private final String updatedSuite;
    private final List<String> hrefs;
    
    public HTMLSuiteResult(String originalSuite) {
        //this.originalSuite = originalSuite;
        StringReader s = new StringReader(originalSuite);
        HTMLEditorKit k = new HTMLEditorKit();
        HTMLDocument doc = (HTMLDocument) k.createDefaultDocument();
        Parser parser = doc.getParser();
        HrefConverter p = new HrefConverter(originalSuite);
        doc.setAsynchronousLoadPriority(-1);
        try {
            parser.parse(s, p, true);
        } catch (IOException e) {
            // DGF aw, this won't really happen!  (will it?)
            throw new RuntimeException(e);
        }
        hrefs = p.hrefList;
        StringBuilder sb = new StringBuilder();
        int previousPosition = originalSuite.length();
        for (int i = p.tagPositions.size()-1; i >= 0; i--) {
            int pos = p.tagPositions.get(i);
            String href = p.hrefList.get(i);
            String snippet = originalSuite.substring(pos, previousPosition); 
            String replaceSnippet = snippet.replaceFirst ("\\Q" + href + "\\E", "#testresult" + i);
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
    
    private class HrefConverter extends ParserCallback {
        public HrefConverter(String foo) {
            this.foo = foo;
        }
        String foo;
        public List<String> hrefList = new ArrayList<String>();
        public List<Integer> tagPositions = new ArrayList<Integer>();
        @Override 
        public void handleStartTag(Tag tag, MutableAttributeSet attributes, int pos) {
            if (Tag.A.equals(tag)) {
                String href = (String) attributes.getAttribute(HTML.Attribute.HREF);
                hrefList.add(href);
                tagPositions.add(pos);
            }
        };
    }

}
