/*
Copyright 2007-2009 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

package org.openqa.selenium;

import org.openqa.selenium.internal.Base64Encoder;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

/**
 * Defines the output type for a screenshot. See org.openqa.selenium.Screenshot for usage and
 * examples.
 * 
 * @see TakesScreenshot
 * @param <T> Type for the screenshot output.
 */
public interface OutputType<T> {
  /**
   * Obtain the screenshot as base64 data.
   */
  OutputType<String> BASE64 = new OutputType<String>() {
    public String convertFromBase64Png(String base64Png) {
      return base64Png;
    }

    public String convertFromPngBytes(byte[] png) {
      return new Base64Encoder().encode(png);
    }
  };

  /**
   * Obtain the screenshot as raw bytes.
   */
  OutputType<byte[]> BYTES = new OutputType<byte[]>() {
    public byte[] convertFromBase64Png(String base64Png) {
      return new Base64Encoder().decode(base64Png);
    }

    public byte[] convertFromPngBytes(byte[] png) {
      return png;
    }
  };

  /**
   * Obtain the screenshot into a temporary file that will be deleted once the JVM exits. It is up
   * to users to make a copy of this file.
   */
  OutputType<File> FILE = new OutputType<File>() {
    public File convertFromBase64Png(String base64Png) {
      return save(BYTES.convertFromBase64Png(base64Png));
    }

    public File convertFromPngBytes(byte[] data) {
      return save(data);
    }

    private File save(byte[] data) {
      OutputStream stream = null;

      try {
        File tmpFile = File.createTempFile("screenshot", ".png");
        tmpFile.deleteOnExit();

        stream = new FileOutputStream(tmpFile);
        stream.write(data);

        return tmpFile;
      } catch (IOException e) {
        throw new WebDriverException(e);
      } finally {
        if (stream != null) {
          try {
            stream.close();
          } catch (IOException e) {
            // Nothing sane to do
          }
        }
      }
    }
  };

  /**
   * Convert the given base64 png to a requested format.
   * 
   * @param base64Png base64 encoded png.
   * @return png encoded into requested format.
   */
  T convertFromBase64Png(String base64Png);

  /**
   * Convert the given png to a requested format.
   * 
   * @param png an array of bytes forming a png file.
   * @return png encoded into requested format.
   */
  T convertFromPngBytes(byte[] png);
}
