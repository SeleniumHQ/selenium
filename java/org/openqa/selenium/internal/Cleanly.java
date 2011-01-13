/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

package org.openqa.selenium.internal;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.Reader;
import java.io.Writer;
import java.nio.channels.Channel;

public class Cleanly {
  public static void close(Channel toClose) {
    if (toClose == null) return;
    
    try {
      toClose.close();
    } catch (IOException e) {
      // nothing that cna done. Ignoring.
    }
  }
  
  public static void close(InputStream toClose) {
    if (toClose == null) return;

    try {
      toClose.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }

  public static void close(OutputStream toClose) {
    if (toClose == null) return;

    try {
      toClose.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }

  public static void close(Reader reader) {
    if (reader == null) return;

    try {
      reader.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }

  public static void close(Writer reader) {
    if (reader == null) return;

    try {
      reader.close();
    } catch (IOException e) {
      // nothing that can done. Ignoring.
    }
  }
}
