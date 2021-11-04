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

package org.openqa.selenium.chromium;

import java.time.Duration;

/**
 * Provides manipulation of getting and setting network conditions from Chromium.
 *
 */
public class ChromiumNetworkConditions {
  public static final String OFFLINE = "offline";
  public static final String LATENCY = "latency";
  public static final String DOWNLOAD_THROUGHPUT = "download_throughput";
  public static final String UPLOAD_THROUGHPUT = "upload_throughput";

  private boolean offline = false;
  private Duration latency = Duration.ZERO;
  private int downloadThroughput = -1;
  private int uploadThroughput = -1;


  /**
   *
   * @return whether network is simulated to be offline.
   */
  public boolean getOffline() {
    return offline;
  }

  /**
   * Whether the network is set to offline. Defaults to false.
   *
   * @param offline when set to true, network is simulated to be offline.
   */
  public void setOffline(boolean offline) {
    this.offline = offline;
  }

  /**
   *  The current simulated latency of the connection.
   *
   * @return amount of latency, typically a Duration of milliseconds.
   */
  public Duration getLatency() {
    return latency;
  }

  /**
   * Sets the simulated latency of the connection.
   *
   * @param latency amount of latency, typically a Duration of milliseconds.
   */
  public void setLatency(Duration latency) {
    this.latency = latency;
  }

  /**
   * The current throughput of the network connection in kb/second for downloading.
   *
   * @return the current download throughput in kb/second.
   */
  public int getDownloadThroughput() {
    return downloadThroughput;
  }

  /**
   * Sets the throughput of the network connection in kb/second for downloading.
   *
   * @param downloadThroughput throughput in kb/second
   */
  public void setDownloadThroughput(int downloadThroughput) {
    this.downloadThroughput = downloadThroughput;
  }

  /**
   * The current throughput of the network connection in kb/second for uploading.
   *
   * @return the current upload throughput in kb/second.
   */
  public int getUploadThroughput() {
    return uploadThroughput;
  }

  /**
   * Sets the throughput of the network connection in kb/second for uploading.
   *
   * @param uploadThroughput throughput in kb/second
   */
  public void setUploadThroughput(int uploadThroughput) {
    this.uploadThroughput = uploadThroughput;
  }
}
