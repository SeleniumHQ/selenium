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

import org.openqa.jetty.util.IO;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;

public class ModifiedIO {
  /**
   * Copy Stream in to Stream out until EOF or exception.
   */
  public static long copy(InputStream in, OutputStream out)
      throws IOException {
    return copy(in, out, -1);
  }

  public static long copy(Reader in, Writer out)
      throws IOException {
    return copy(in, out, -1);
  }

  /**
   * Copy Stream in to Stream for byteCount bytes or until EOF or exception.
   * 
   * @return Copied bytes count or -1 if no bytes were read *and* EOF was reached
   */
  public static long copy(InputStream in,
                          OutputStream out,
                          long byteCount)
      throws IOException {
    byte buffer[] = new byte[IO.bufferSize];
    int len;

    long returnVal = 0;

    if (byteCount >= 0) {
      while (byteCount > 0) {
        if (byteCount < IO.bufferSize)
          len = in.read(buffer, 0, (int) byteCount);
        else
          len = in.read(buffer, 0, IO.bufferSize);

        if (len == -1) {
          break;
        }
        returnVal += len;

        byteCount -= len;
        out.write(buffer, 0, len);
      }
    } else {
      while (true) {
        len = in.read(buffer, 0, IO.bufferSize);
        if (len < 0) {
          break;
        }
        returnVal += len;
        out.write(buffer, 0, len);
      }
    }

    return returnVal;
  }

  /**
   * Copy Reader to Writer for byteCount bytes or until EOF or exception.
   */
  public static long copy(Reader in,
                          Writer out,
                          long byteCount)
      throws IOException {
    char buffer[] = new char[IO.bufferSize];
    int len;

    long returnVal = 0;

    if (byteCount >= 0) {
      while (byteCount > 0) {
        if (byteCount < IO.bufferSize)
          len = in.read(buffer, 0, (int) byteCount);
        else
          len = in.read(buffer, 0, IO.bufferSize);

        if (len == -1) {
          break;
        }
        returnVal += len;

        byteCount -= len;
        out.write(buffer, 0, len);
      }
    } else {
      while (true) {
        len = in.read(buffer, 0, IO.bufferSize);
        if (len == -1) {
          break;
        }
        returnVal += len;
        out.write(buffer, 0, len);
      }
    }

    return returnVal;
  }

}
