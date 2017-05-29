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

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.logging.Logger;

/**
 * Utility class for java.io annoyances.
 */
public class IOHelper {

  private static final Logger log = Logger.getLogger(IOHelper.class.getName());
  private static final int DEFAULT_COPY_BUFFER_SIZE = 1024;

  public static void close(InputStream stream) {
    if (null == stream) {
      return;
    }
    try {
      stream.close();
    } catch (IOException e) {
      log.info("Ignoring exception while closing " + stream);
    }
  }

  /**
   * Read a file on the file system and return its content as a stream of bytes.
   * 
   * @param filePath Path of the file to read. Cannot be null.
   * @return File content. Never null.
   * @throws IOException on error
   */
  public static byte[] readFile(String filePath) throws IOException {
    final ByteArrayOutputStream outputStream;
    FileInputStream inputStream = null;

    try {
      inputStream = new FileInputStream(filePath);
      outputStream = new ByteArrayOutputStream();
      copyStream(inputStream, outputStream);

      return outputStream.toByteArray();
    } finally {
      close(inputStream);
    }
  }


  /**
   * Copy remaining stream content to another stream.
   * 
   * @param in Input stream to copy (remaining) content from. Cannot be null.
   * @param out Output stream to copy content to. Cannot be null.
   * @throws IOException on IO error.
   * @throws java.lang.AssertionError If <code>in</code> or <code>out</code> is null.
   */
  public static void copyStream(InputStream in, OutputStream out) throws IOException {
    copyStream(in, out, DEFAULT_COPY_BUFFER_SIZE);
  }


  /**
   * Copy remaining stream content to another stream.
   * 
   * @param in Input stream to copy (remaining) content from. Cannot be null.
   * @param out Output stream to copy content to. Cannot be null.
   * @param copyBufferSize Size of the maximum chunk of data that will be copied in one step. A
   *        buffer a this size will be allocated internally so beware of the usual speed vs. memory
   *        tradeoff. Must be strictly positive.
   * @throws IOException on IO error.
   * @throws java.lang.AssertionError If <code>copyBufferSize</code> is negative, <code>in</code> is
   *         null or <code>out</code> is null.
   */
  public static void copyStream(InputStream in, OutputStream out, int copyBufferSize)
      throws IOException {
    final byte[] buffer;
    int bytesRead;

    buffer = new byte[copyBufferSize];
    while (true) {
      bytesRead = in.read(buffer);
      if (bytesRead < 0) { /* End of stream */
        break;
      }
      out.write(buffer, 0, bytesRead);
    }
    out.flush();
  }

}
