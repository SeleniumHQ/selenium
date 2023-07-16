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

package org.openqa.selenium.io;

import java.io.*;
import java.util.concurrent.Future;
import java.util.concurrent.FutureTask;
import java.util.logging.Level;
import java.util.logging.Logger;

/** Utility methods for common stream activities */
public class StreamHelper {

  private static final Logger LOG = Logger.getLogger(StreamHelper.class.getName());

  private static long transferTo(InputStream in, OutputStream out) throws IOException {
    // with JDK 9+ we can use in.transferTo(out); to replace this method
    long transfered = 0;
    int read;
    byte[] bytes = new byte[4096];
    while ((read = in.read(bytes, 0, bytes.length)) != -1) {
      out.write(bytes, 0, read);
      transfered += read;
    }
    return transfered;
  }

  public static Future<Void> asyncTransferTo(InputStream in, OutputStream out) {
    FutureTask<Void> future = new FutureTask<>(() -> {
      try {
        transferTo(in, out);
      } catch (IOException e) {
        LOG.log(Level.WARNING, "transferring output for process failed.", e);
      } finally {
        in.close();
      }

      return null;
    });
    Thread copy = new Thread(future) {
      {
        setDaemon(true);
      }
    };

    copy.start();

    return future;
  }

}
