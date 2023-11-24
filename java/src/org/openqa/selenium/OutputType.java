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

package org.openqa.selenium;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

/**
 * Defines the output type for a screenshot.
 *
 * @see TakesScreenshot
 * @param <T> Type for the screenshot output.
 */
public interface OutputType<T> {
  /** Obtain the screenshot as base64 data. */
  OutputType<String> BASE64 =
      new OutputType<String>() {
        @Override
        public String convertFromBase64Png(String base64Png) {
          return base64Png;
        }

        @Override
        public String convertFromPngBytes(byte[] png) {
          return Base64.getEncoder().encodeToString(png);
        }

        public String toString() {
          return "OutputType.BASE64";
        }
      };

  /** Obtain the screenshot as raw bytes. */
  OutputType<byte[]> BYTES =
      new OutputType<byte[]>() {
        @Override
        public byte[] convertFromBase64Png(String base64Png) {
          return Base64.getDecoder().decode(base64Png);
        }

        @Override
        public byte[] convertFromPngBytes(byte[] png) {
          return png;
        }

        public String toString() {
          return "OutputType.BYTES";
        }
      };

  /**
   * Obtain the screenshot into a temporary file that will be deleted once the JVM exits. It is up
   * to users to make a copy of this file.
   */
  OutputType<File> FILE =
      new OutputType<File>() {
        @Override
        public File convertFromBase64Png(String base64Png) {
          return save(BYTES.convertFromBase64Png(base64Png));
        }

        @Override
        public File convertFromPngBytes(byte[] data) {
          return save(data);
        }

        private File save(byte[] data) {
          try {
            Path tmpFilePath = Files.createTempFile("screenshot", ".png");
            File tmpFile = tmpFilePath.toFile();
            tmpFile.deleteOnExit();
            Files.write(tmpFilePath, data);
            return tmpFile;
          } catch (IOException e) {
            throw new WebDriverException(e);
          }
        }

        public String toString() {
          return "OutputType.FILE";
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
