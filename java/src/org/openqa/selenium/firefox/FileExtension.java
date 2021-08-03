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

package org.openqa.selenium.firefox;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.io.TemporaryFilesystem;
import org.openqa.selenium.io.Zip;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.w3c.dom.Document;
import org.w3c.dom.Node;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.util.Iterator;
import java.util.Map;

import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

public class FileExtension implements Extension {
  private static final String EM_NAMESPACE_URI = "http://www.mozilla.org/2004/em-rdf#";

  private final File toInstall;

  public FileExtension(File toInstall) {
    this.toInstall = toInstall;
  }

  @Override
  public void writeTo(File extensionsDir) throws IOException {
    if (!toInstall.isDirectory() &&
        !FileHandler.isZipped(toInstall.getAbsolutePath())) {
      throw new IOException(
          String.format("Can only install from a zip file, an XPI or a directory: %s",
              toInstall.getAbsolutePath()));
    }

    if (toInstall.isDirectory()) {
      installExtensionFromDirectoryTo(extensionsDir);
    } else {
      installExtensionFromFileTo(extensionsDir);
    }
  }

  private void installExtensionFromDirectoryTo(File extensionsDir) throws IOException {
    String id = getExtensionId(toInstall);
    File target = new File(extensionsDir, id);

    if (target.exists() && !FileHandler.delete(target)) {
      throw new IOException("Unable to delete existing extension directory: " + target);
    }

    FileHandler.createDir(target);
    FileHandler.makeWritable(target);
    FileHandler.copy(toInstall, target);
  }

  private void installExtensionFromFileTo(File extensionsDir) throws IOException {
    File unpackedExt = obtainRootDirectory(toInstall);
    String id = getExtensionId(unpackedExt);
    File target = new File(extensionsDir, id + ".xpi");

    if (target.exists() && !FileHandler.delete(target)) {
      throw new IOException("Unable to delete existing extension file: " + target);
    }

    FileHandler.createDir(extensionsDir);
    FileHandler.makeWritable(extensionsDir);
    FileHandler.copy(toInstall, target);
    TemporaryFilesystem.getDefaultTmpFS().deleteTempDir(unpackedExt);
  }

  private File obtainRootDirectory(File extensionToInstall) throws IOException {
    File root = extensionToInstall;
    if (!extensionToInstall.isDirectory()) {
      try (BufferedInputStream bis = new BufferedInputStream(
          new FileInputStream(extensionToInstall))) {
        root = Zip.unzipToTempDir(bis, "unzip", "stream");
      }
    }
    return root;
  }

  private String getExtensionId(File root) {
    File manifestJson = new File(root, "manifest.json");
    File installRdf = new File(root, "install.rdf");

    if (installRdf.exists()) {
      return readIdFromInstallRdf(root);
    } else if (manifestJson.exists()) {
      return readIdFromManifestJson(root);
    } else {
      throw new WebDriverException(
          "Extension should contain either install.rdf or manifest.json metadata file");
    }
  }

  private String readIdFromManifestJson(File root) {
    final String MANIFEST_JSON_FILE = "manifest.json";
    File manifestJsonFile = new File(root, MANIFEST_JSON_FILE);
    try (Reader reader = Files.newBufferedReader(manifestJsonFile.toPath(), UTF_8);
         JsonInput json = new Json().newInput(reader)) {
      String addOnId = null;

      Map<String, Object> manifestObject = json.read(MAP_TYPE);
      if (manifestObject.get("applications") instanceof Map) {
        Map<?, ?> applicationObj = (Map<?, ?>) manifestObject.get("applications");
        if (applicationObj.get("gecko") instanceof Map) {
          Map<?, ?> geckoObj = (Map<?, ?>) applicationObj.get("gecko");
          if (geckoObj.get("id") instanceof String) {
            addOnId = ((String) geckoObj.get("id")).trim();
          }
        }
      }

      if (addOnId == null || addOnId.isEmpty()) {
        addOnId = ((String) manifestObject.get("name")).replaceAll(" ", "") +
          "@" + manifestObject.get("version");
      }

      return addOnId;
    } catch (FileNotFoundException e1) {
      throw new WebDriverException("Unable to file manifest.json in xpi file");
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private String readIdFromInstallRdf(File root) {
    try {
      File installRdf = new File(root, "install.rdf");

      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
      factory.setNamespaceAware(true);
      factory.setExpandEntityReferences(false);
      DocumentBuilder builder = factory.newDocumentBuilder();
      Document doc = builder.parse(installRdf);

      XPath xpath = XPathFactory.newInstance().newXPath();
      xpath.setNamespaceContext(new NamespaceContext() {
        @Override
        public String getNamespaceURI(String prefix) {
          if ("em".equals(prefix)) {
            return EM_NAMESPACE_URI;
          } else if ("RDF".equals(prefix)) {
            return "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
          }

          return XMLConstants.NULL_NS_URI;
        }

        @Override
        public String getPrefix(String uri) {
          throw new UnsupportedOperationException("getPrefix");
        }

        @Override
        public Iterator<String> getPrefixes(String uri) {
          throw new UnsupportedOperationException("getPrefixes");
        }
      });

      Node idNode = (Node) xpath.compile("//em:id").evaluate(doc, XPathConstants.NODE);

      String id;
      if (idNode == null) {
        Node descriptionNode =
            (Node) xpath.compile("//RDF:Description").evaluate(doc, XPathConstants.NODE);
        Node idAttr = descriptionNode.getAttributes().getNamedItemNS(EM_NAMESPACE_URI, "id");
        if (idAttr == null) {
          throw new WebDriverException(
              "Cannot locate node containing extension id: " + installRdf.getAbsolutePath());
        }
        id = idAttr.getNodeValue();
      } else {
        id = idNode.getTextContent();
      }

      if (id == null || "".equals(id.trim())) {
        throw new FileNotFoundException("Cannot install extension with ID: " + id);
      }
      return id;
    } catch (Exception e) {
      throw new WebDriverException(e);
    }
  }
}
