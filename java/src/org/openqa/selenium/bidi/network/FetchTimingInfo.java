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

package org.openqa.selenium.bidi.network;

import org.openqa.selenium.Beta;

/**
 * @see <a href="https://www.w3.org/TR/webdriver-bidi/#cddl-type-networkfetchtiminginfo">BiDi
 *     spec</a>
 */
@Beta
public class FetchTimingInfo {

  private final double timeOrigin;
  private final double requestTime;
  private final double redirectStart;
  private final double redirectEnd;
  private final double fetchStart;
  private final double dnsStart;
  private final double dnsEnd;
  private final double connectStart;
  private final double connectEnd;
  private final double tlsStart;
  private final double requestStart;
  private final double responseStart;
  private final double responseEnd;

  private FetchTimingInfo(
      double timeOrigin,
      double requestTime,
      double redirectStart,
      double redirectEnd,
      double fetchStart,
      double dnsStart,
      double dnsEnd,
      double connectStart,
      double connectEnd,
      double tlsStart,
      double requestStart,
      double responseStart,
      double responseEnd) {
    this.timeOrigin = timeOrigin;
    this.requestTime = requestTime;
    this.redirectStart = redirectStart;
    this.redirectEnd = redirectEnd;
    this.fetchStart = fetchStart;
    this.dnsStart = dnsStart;
    this.dnsEnd = dnsEnd;
    this.connectStart = connectStart;
    this.connectEnd = connectEnd;
    this.tlsStart = tlsStart;
    this.requestStart = requestStart;
    this.responseStart = responseStart;
    this.responseEnd = responseEnd;
  }

  public double getTimeOrigin() {
    return timeOrigin;
  }

  public double getRequestTime() {
    return requestTime;
  }

  public double getRedirectStart() {
    return redirectStart;
  }

  public double getRedirectEnd() {
    return redirectEnd;
  }

  public double getFetchStart() {
    return fetchStart;
  }

  public double getDnsStart() {
    return dnsStart;
  }

  public double getDnsEnd() {
    return dnsEnd;
  }

  public double getConnectStart() {
    return connectStart;
  }

  public double getConnectEnd() {
    return connectEnd;
  }

  public double getTlsStart() {
    return tlsStart;
  }

  public double getRequestStart() {
    return requestStart;
  }

  public double getResponseStart() {
    return responseStart;
  }

  public double getResponseEnd() {
    return responseEnd;
  }
}
