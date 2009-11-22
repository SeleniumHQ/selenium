/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import org.openqa.selenium.internal.Base64Encoder;

/**
 * Defines the output type for a screenshot. See org.openqa.selenium.Screenshot
 * for usage and examples.
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
  };
  
  /**
   * Obtain the screenshot as raw bytes.
   */
  OutputType<byte[]> BYTES = new OutputType<byte[]>() {
  	public byte[] convertFromBase64Png(String base64Png) {
		  return new Base64Encoder().decode(base64Png);
  	} 
  };
  
  /**
   * Obtain the screenshot into a temporary file that will be deleted once the
   * JVM exits. It is up to users to make a copy of this file.
   */
  OutputType<File> FILE = new OutputType<File>() {
  	public File convertFromBase64Png(String base64Png) {
      FileOutputStream fos = null;
  		try {
  			byte[] data = BYTES.convertFromBase64Png(base64Png);
  			File tmpFile = File.createTempFile("screenshot", ".png");
        tmpFile.deleteOnExit();
  			fos = new FileOutputStream(tmpFile);
  			fos.write(data);
  			return tmpFile;
  		} catch (IOException e) {
  			throw new WebDriverException(e);
  		} finally {
        if (fos != null) {
          try {
            fos.close();
          } catch (IOException e) {
            // Nothing sensible to do
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
}
