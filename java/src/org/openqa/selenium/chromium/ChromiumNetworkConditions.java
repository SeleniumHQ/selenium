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
  private Boolean offline = false;
  private Duration latency = Duration.ZERO;
  private Number downloadThroughput = -1;
  private Number uploadThroughput = -1;

  public static final String OFFLINE = "offline";
  public static final String LATENCY = "latency";
  public static final String DOWNLOAD_THROUGHPUT = "download_throughput";
  public static final String UPLOAD_THROUGHPUT = "upload_throughput";

  /**
   *
   * @return whether network is simulated to be offline.
   */
  public Boolean getOffline() {
    return offline;
  }

  /**
   * Whether the network is set to offline. Defaults to false.
   *
   * @param offline when set to true, network is simulated to be offline.
   */
  public void setOffline(Boolean offline) {
    this.offline = offline;
  }

  /**
   *
   * @return
   */
  public Duration getLatency() {
    return latency;
  }

  /**
   *
   * @param latency
   */
  public void setLatency(Duration latency) {
    this.latency = latency;
  }

  /**
   *
   * @return
   */
  public Number getDownloadThroughput() {
    return downloadThroughput;
  }

  /**
   *
   * @param downloadThroughput
   */
  public void setDownloadThroughput(Number downloadThroughput) {
    this.downloadThroughput = downloadThroughput;
  }

  /**
   *
   * @return
   */
  public Number getUploadThroughput() {
    return uploadThroughput;
  }

  /**
   *
   * @param uploadThroughput
   */
  public void setUploadThroughput(Number uploadThroughput) {
    this.uploadThroughput = uploadThroughput;
  }
}
