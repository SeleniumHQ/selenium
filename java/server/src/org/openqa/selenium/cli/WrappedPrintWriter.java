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

package org.openqa.selenium.cli;

import com.google.common.base.Preconditions;

import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Writer;

public class WrappedPrintWriter extends PrintWriter {

  private final int lineLength;
  private final int indentBy;
  private int position = 0;

  public WrappedPrintWriter(OutputStream out, int lineLength, int indentBy) {
    this(new OutputStreamWriter(out), lineLength, indentBy);
  }

  public WrappedPrintWriter(Writer out, int lineLength, int indentBy) {
    super(out);

    Preconditions.checkArgument(lineLength > 10, "Lines must be 10 or more characters.");
    Preconditions.checkArgument(indentBy >= 0, "An indent cannot be less than 0.");

    this.lineLength = lineLength;
    this.indentBy = indentBy;

  }

  @Override
  public void write(int c) {
    if (c == '\n') {
      super.write(c);
      position = 0;
    } else if (position > lineLength && Character.isWhitespace(c)) {
      super.write('\n');
      for (int i = 0; i < indentBy; i++) {
        super.write(' ');
      }
      position = indentBy;
      return;
    } else {
      super.write(c);
      position++;
    }

    flush();
  }

  @Override
  public void write(char[] buf, int off, int len) {
    for (int i = 0; i < len; i++) {
      write(buf[off + i]);
    }
  }

  @Override
  public void write(String s, int off, int len) {
    for (int i = 0; i < len; i++) {
      write(s.charAt(off + i));
    }
  }
}
