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

package org.openqa.selenium.tools.zip;

import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.util.zip.ZipEntry;

public class StableZipEntry extends ZipEntry {

  // Starts at 1980-01-01. We'll match what buck uses
  private static final long DOS_EPOCH = Instant.parse("1985-02-01T00:00:00.00Z").toEpochMilli();

  public StableZipEntry(String name) {
    super(name);

    setTime(DOS_EPOCH);
    setCreationTime(FileTime.fromMillis(DOS_EPOCH));
    setLastModifiedTime(FileTime.fromMillis(DOS_EPOCH));
  }
}
