/*
 * Copyright 2004 ThoughtWorks, Inc.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.selenium.embedded.jetty;

import org.mortbay.http.HttpException;
import org.mortbay.http.HttpFields;
import org.mortbay.http.HttpRequest;
import org.mortbay.http.HttpResponse;
import org.mortbay.http.handler.ResourceHandler;
import org.mortbay.jetty.servlet.ServletHttpContext;
import org.mortbay.util.StringUtil;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;

/**
 * @author Paul Hammant
 * @version $Revision: 131 $
 */
public class TestIngPurposesStaticContentHandler implements StaticContentHandler {

    public void addStaticContent(ServletHttpContext context) {
        context.addHandler(new ResourceHandler() {
            public void handle(String s, String s1, HttpRequest req, HttpResponse res) throws HttpException, IOException {
                OutputStream out = res.getOutputStream();
                ByteArrayOutputStream buf = new ByteArrayOutputStream(10000);
                Writer writer = new OutputStreamWriter(buf, StringUtil.__ISO_8859_1);
                if (req.getRequestLine().indexOf("SeleneseTests.html") != -1) {
                    res.setField(HttpFields.__ContentType, "text/html");
                    res.setField("Expires", "0"); // never cached.
                    writePage(writer, seleneseTestsDotHtml, buf, out);
                    req.setHandled(true);
                } else if (req.getRequestLine().indexOf("xmlextras.js") != -1) {
                    res.setField(HttpFields.__ContentType, "text/plain");
                    res.setField("Expires", "0"); // never cached.                    
                    writePage(writer, xmlextrasDotJs, buf, out);
                    req.setHandled(true);
                } else {
                    req.setHandled(false);
                }
            }
        });
    }

    private void writePage(Writer writer, String page, ByteArrayOutputStream buf, OutputStream out) throws IOException {
        writer.flush();
        writer.write(page);
        for (int pad = 99998 - buf.size(); pad-- > 0;) {
            writer.write(" ");
        }
        writer.write("\015\012");
        writer.flush();
        buf.writeTo(out);
    }

    private static final String seleneseTestsDotHtml = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">\n" +
            "<html>\n" +
            "<head>\n" +
            "  <script type=\"text/javascript\" src=\"xmlextras.js\"></script>\n" +
            "</head>\n" +
            "<body>\n" +
            "<b>Please ignore this page. It is not Selenium in action, " +
            "it is a rudimentary test of Selenium's transport</b><br><br>" +
            "Selenium { <br>\n" +
            "<script type=\"text/javascript\">\n" +
            " var xmlHttp = XmlHttp.create();\n" +
            "\n" +
            " xmlHttp.open(\"GET\", \"driver?seleniumStart=true\", false);\n" +
            " xmlHttp.send(null);\n" +
            " command = xmlHttp.responseText\n" +
            " document.write('&nbsp;&nbsp;Request 1 sent : seleniumStart=true<br>')\n" +
            " document.write('&nbsp;&nbsp;Request 1 rcvd : ' + command + '<br><br>')\n" +
            "\n" +
            " xmlHttp = XmlHttp.create();\n" +
            " xmlHttp.open(\"GET\", \"driver?commandResult=OK\",false);\n" +
            " xmlHttp.send(null);\n" +
            " command = xmlHttp.responseText\n" +
            " document.write('&nbsp;&nbsp;Request 2 sent : commandResult=OK<br>')\n" +
            " document.write('&nbsp;&nbsp;Request 2 rcvd : ' + command + '<br><br>')\n" +
            "\n" +
            " xmlHttp = XmlHttp.create();\n" +
            " xmlHttp.open(\"GET\", \"driver?commandResult=OK\",false);\n" +
            " xmlHttp.send(null);\n" +
            " command = xmlHttp.responseText\n" +
            " document.write('&nbsp;&nbsp;Request 3 sent : commandResult=OK<br>')\n" +
            " document.write('&nbsp;&nbsp;Request 3 rcvd : ' + command + '<br><br>')\n" +
            "\n" +
            " xmlHttp = XmlHttp.create();\n" +
            " xmlHttp.open(\"GET\", \"driver?commandResult=OK\",false);\n" +
            " xmlHttp.send(null);\n" +
            " command = xmlHttp.responseText\n" +
            " document.write('&nbsp;&nbsp;Request 4 sent : commandResult=OK<br>')\n" +
            " document.write('&nbsp;&nbsp;Request 4 rcvd : ' + command + '<br>')\n" +
            "\n" +
            "</script>\n" +
            "}\n" +
            "</body>\n" +
            "</html>";

    private static final String xmlextrasDotJs = "// This is a third party JavaScript library from\n" +
            "// http://webfx.eae.net/dhtml/xmlextras/xmlextras.html\n" +
            "// i.e. This has not been written by ThoughtWorks.\n" +
            "// It is not in itself subject to the Apache 2.0 license.\n" +
            "// That ThoughtWorks have specified for Selnium.\n" +
            "\n" +
            "//<script>\n" +
            "//////////////////\n" +
            "// Helper Stuff //\n" +
            "//////////////////\n" +
            "\n" +
            "// used to find the Automation server name\n" +
            "function getDomDocumentPrefix() {\n" +
            "\tif (getDomDocumentPrefix.prefix)\n" +
            "\t\treturn getDomDocumentPrefix.prefix;\n" +
            "\t\n" +
            "\tvar prefixes = [\"MSXML2\", \"Microsoft\", \"MSXML\", \"MSXML3\"];\n" +
            "\tvar o;\n" +
            "\tfor (var i = 0; i < prefixes.length; i++) {\n" +
            "\t\ttry {\n" +
            "\t\t\t// try to create the objects\n" +
            "\t\t\to = new ActiveXObject(prefixes[i] + \".DomDocument\");\n" +
            "\t\t\treturn getDomDocumentPrefix.prefix = prefixes[i];\n" +
            "\t\t}\n" +
            "\t\tcatch (ex) {};\n" +
            "\t}\n" +
            "\t\n" +
            "\tthrow new Error(\"Could not find an installed XML parser\");\n" +
            "}\n" +
            "\n" +
            "function getXmlHttpPrefix() {\n" +
            "\tif (getXmlHttpPrefix.prefix)\n" +
            "\t\treturn getXmlHttpPrefix.prefix;\n" +
            "\t\n" +
            "\tvar prefixes = [\"MSXML2\", \"Microsoft\", \"MSXML\", \"MSXML3\"];\n" +
            "\tvar o;\n" +
            "\tfor (var i = 0; i < prefixes.length; i++) {\n" +
            "\t\ttry {\n" +
            "\t\t\t// try to create the objects\n" +
            "\t\t\to = new ActiveXObject(prefixes[i] + \".XmlHttp\");\n" +
            "\t\t\treturn getXmlHttpPrefix.prefix = prefixes[i];\n" +
            "\t\t}\n" +
            "\t\tcatch (ex) {};\n" +
            "\t}\n" +
            "\t\n" +
            "\tthrow new Error(\"Could not find an installed XML parser\");\n" +
            "}\n" +
            "\n" +
            "//////////////////////////\n" +
            "// Start the Real stuff //\n" +
            "//////////////////////////\n" +
            "\n" +
            "\n" +
            "// XmlHttp factory\n" +
            "function XmlHttp() {}\n" +
            "\n" +
            "XmlHttp.create = function () {\n" +
            "\ttry {\n" +
            "\t\tif (window.XMLHttpRequest) {\n" +
            "\t\t\tvar req = new XMLHttpRequest();\n" +
            "\t\t\t\n" +
            "\t\t\t// some versions of Moz do not support the readyState property\n" +
            "\t\t\t// and the onreadystate event so we patch it!\n" +
            "\t\t\tif (req.readyState == null) {\n" +
            "\t\t\t\treq.readyState = 1;\n" +
            "\t\t\t\treq.addEventListener(\"load\", function () {\n" +
            "\t\t\t\t\treq.readyState = 4;\n" +
            "\t\t\t\t\tif (typeof req.onreadystatechange == \"function\")\n" +
            "\t\t\t\t\t\treq.onreadystatechange();\n" +
            "\t\t\t\t}, false);\n" +
            "\t\t\t}\n" +
            "\t\t\t\n" +
            "\t\t\treturn req;\n" +
            "\t\t}\n" +
            "\t\tif (window.ActiveXObject) {\n" +
            "\t\t\treturn new ActiveXObject(getXmlHttpPrefix() + \".XmlHttp\");\n" +
            "\t\t}\n" +
            "\t}\n" +
            "\tcatch (ex) {}\n" +
            "\t// fell through\n" +
            "\tthrow new Error(\"Your browser does not support XmlHttp objects\");\n" +
            "};\n" +
            "\n" +
            "// XmlDocument factory\n" +
            "function XmlDocument() {}\n" +
            "\n" +
            "XmlDocument.create = function () {\n" +
            "\ttry {\n" +
            "\t\t// DOM2\n" +
            "\t\tif (document.implementation && document.implementation.createDocument) {\n" +
            "\t\t\tvar doc = document.implementation.createDocument(\"\", \"\", null);\n" +
            "\t\t\t\n" +
            "\t\t\t// some versions of Moz do not support the readyState property\n" +
            "\t\t\t// and the onreadystate event so we patch it!\n" +
            "\t\t\tif (doc.readyState == null) {\n" +
            "\t\t\t\tdoc.readyState = 1;\n" +
            "\t\t\t\tdoc.addEventListener(\"load\", function () {\n" +
            "\t\t\t\t\tdoc.readyState = 4;\n" +
            "\t\t\t\t\tif (typeof doc.onreadystatechange == \"function\")\n" +
            "\t\t\t\t\t\tdoc.onreadystatechange();\n" +
            "\t\t\t\t}, false);\n" +
            "\t\t\t}\n" +
            "\t\t\t\n" +
            "\t\t\treturn doc;\n" +
            "\t\t}\n" +
            "\t\tif (window.ActiveXObject)\n" +
            "\t\t\treturn new ActiveXObject(getDomDocumentPrefix() + \".DomDocument\");\n" +
            "\t}\n" +
            "\tcatch (ex) {}\n" +
            "\tthrow new Error(\"Your browser does not support XmlDocument objects\");\n" +
            "};\n" +
            "\n" +
            "// Create the loadXML method and xml getter for Mozilla\n" +
            "if (window.DOMParser &&\n" +
            "\twindow.XMLSerializer &&\n" +
            "\twindow.Node && Node.prototype && Node.prototype.__defineGetter__) {\n" +
            "\n" +
            "\t// XMLDocument did not extend the Document interface in some versions\n" +
            "\t// of Mozilla. Extend both!\n" +
            "\t//XMLDocument.prototype.loadXML = \n" +
            "\tDocument.prototype.loadXML = function (s) {\n" +
            "\t\t\n" +
            "\t\t// parse the string to a new doc\t\n" +
            "\t\tvar doc2 = (new DOMParser()).parseFromString(s, \"text/xml\");\n" +
            "\t\t\n" +
            "\t\t// remove all initial children\n" +
            "\t\twhile (this.hasChildNodes())\n" +
            "\t\t\tthis.removeChild(this.lastChild);\n" +
            "\t\t\t\n" +
            "\t\t// insert and import nodes\n" +
            "\t\tfor (var i = 0; i < doc2.childNodes.length; i++) {\n" +
            "\t\t\tthis.appendChild(this.importNode(doc2.childNodes[i], true));\n" +
            "\t\t}\n" +
            "\t};\n" +
            "\t\n" +
            "\t\n" +
            "\t/*\n" +
            "\t * xml getter\n" +
            "\t *\n" +
            "\t * This serializes the DOM tree to an XML String\n" +
            "\t *\n" +
            "\t * Usage: var sXml = oNode.xml\n" +
            "\t *\n" +
            "\t */\n" +
            "\t// XMLDocument did not extend the Document interface in some versions\n" +
            "\t// of Mozilla. Extend both!\n" +
            "\t/*\n" +
            "\tXMLDocument.prototype.__defineGetter__(\"xml\", function () {\n" +
            "\t\treturn (new XMLSerializer()).serializeToString(this);\n" +
            "\t});\n" +
            "\t*/\n" +
            "\tDocument.prototype.__defineGetter__(\"xml\", function () {\n" +
            "\t\treturn (new XMLSerializer()).serializeToString(this);\n" +
            "\t});\n" +
            "}";

}
