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

package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.json.JsonInput;

/**
 * Timing information for the request
 */
public class ResourceTiming {

  private double requestTime;

  private double proxyStart;

  private double proxyEnd;

  private double dnsStart;

  private double dnsEnd;

  private double connectStart;

  private double connectEnd;

  private double sslStart;

  private double sslEnd;

  private Double workerStart;

  private Double workerReady;

  private double sendStart;

  private double sendEnd;

  private Double pushStart;

  private Double pushEnd;

  private double receiveHeadersEnd;

  public ResourceTiming(double requestTime, double proxyStart, double proxyEnd,
                        double dnsStart, double dnsEnd, double connectStart,
                        double connectEnd, double sslStart, double sslEnd,
                        Double workerStart, Double workerReady, double sendStart,
                        double sendEnd, Double pushStart, Double pushEnd,
                        double receiveHeadersEnd) {
    this.requestTime = requestTime;
    this.proxyStart = proxyStart;
    this.proxyEnd = proxyEnd;
    this.dnsStart = dnsStart;
    this.dnsEnd = dnsEnd;
    this.connectStart = connectStart;
    this.connectEnd = connectEnd;
    this.sslStart = sslStart;
    this.sslEnd = sslEnd;
    this.workerStart = workerStart;
    this.workerReady = workerReady;
    this.sendStart = sendStart;
    this.sendEnd = sendEnd;
    this.pushStart = pushStart;
    this.pushEnd = pushEnd;
    this.receiveHeadersEnd = receiveHeadersEnd;
  }

  /**
   * Timing's requestTime is a baseline in seconds, while the other numbers are ticks in
   * milliseconds relatively to this requestTime.
   */
  public double getRequestTime() {
    return requestTime;
  }

  /**
   * Timing's requestTime is a baseline in seconds, while the other numbers are ticks in
   * milliseconds relatively to this requestTime.
   */
  public void setRequestTime(double requestTime) {
    this.requestTime = requestTime;
  }

  /**
   * Started resolving proxy.
   */
  public double getProxyStart() {
    return proxyStart;
  }

  /**
   * Started resolving proxy.
   */
  public void setProxyStart(double proxyStart) {
    this.proxyStart = proxyStart;
  }

  /**
   * Finished resolving proxy.
   */
  public double getProxyEnd() {
    return proxyEnd;
  }

  /**
   * Finished resolving proxy.
   */
  public void setProxyEnd(double proxyEnd) {
    this.proxyEnd = proxyEnd;
  }

  /**
   * Started DNS address resolve.
   */
  public double getDnsStart() {
    return dnsStart;
  }

  /**
   * Started DNS address resolve.
   */
  public void setDnsStart(double dnsStart) {
    this.dnsStart = dnsStart;
  }

  /**
   * Finished DNS address resolve.
   */
  public double getDnsEnd() {
    return dnsEnd;
  }

  /**
   * Finished DNS address resolve.
   */
  public void setDnsEnd(double dnsEnd) {
    this.dnsEnd = dnsEnd;
  }

  /**
   * Started connecting to the remote host.
   */
  public double getConnectStart() {
    return connectStart;
  }

  /**
   * Started connecting to the remote host.
   */
  public void setConnectStart(double connectStart) {
    this.connectStart = connectStart;
  }

  /**
   * Connected to the remote host.
   */
  public double getConnectEnd() {
    return connectEnd;
  }

  /**
   * Connected to the remote host.
   */
  public void setConnectEnd(double connectEnd) {
    this.connectEnd = connectEnd;
  }

  /**
   * Started SSL handshake.
   */
  public double getSslStart() {
    return sslStart;
  }

  /**
   * Started SSL handshake.
   */
  public void setSslStart(double sslStart) {
    this.sslStart = sslStart;
  }

  /**
   * Finished SSL handshake.
   */
  public double getSslEnd() {
    return sslEnd;
  }

  /**
   * Finished SSL handshake.
   */
  public void setSslEnd(double sslEnd) {
    this.sslEnd = sslEnd;
  }

  /**
   * Started running ServiceWorker.
   */
  public Double getWorkerStart() {
    return workerStart;
  }

  /**
   * Started running ServiceWorker.
   */
  public void setWorkerStart(Double workerStart) {
    this.workerStart = workerStart;
  }

  /**
   * Finished Starting ServiceWorker.
   */
  public Double getWorkerReady() {
    return workerReady;
  }

  /**
   * Finished Starting ServiceWorker.
   */
  public void setWorkerReady(Double workerReady) {
    this.workerReady = workerReady;
  }

  /**
   * Started sending request.
   */
  public double getSendStart() {
    return sendStart;
  }

  /**
   * Started sending request.
   */
  public void setSendStart(double sendStart) {
    this.sendStart = sendStart;
  }

  /**
   * Finished sending request.
   */
  public double getSendEnd() {
    return sendEnd;
  }

  /**
   * Finished sending request.
   */
  public void setSendEnd(double sendEnd) {
    this.sendEnd = sendEnd;
  }

  /**
   * Time the server started pushing request.
   */
  public Double getPushStart() {
    return pushStart;
  }

  /**
   * Time the server started pushing request.
   */
  public void setPushStart(Double pushStart) {
    this.pushStart = pushStart;
  }

  /**
   * Time the server finished pushing request.
   */
  public Double getPushEnd() {
    return pushEnd;
  }

  /**
   * Time the server finished pushing request.
   */
  public void setPushEnd(Double pushEnd) {
    this.pushEnd = pushEnd;
  }

  /**
   * Finished receiving response headers.
   */
  public double getReceiveHeadersEnd() {
    return receiveHeadersEnd;
  }

  /**
   * Finished receiving response headers.
   */
  public void setReceiveHeadersEnd(double receiveHeadersEnd) {
    this.receiveHeadersEnd = receiveHeadersEnd;
  }

  private static ResourceTiming fromJson(JsonInput input) {

    input.beginObject();

    Double requestTime = null;

    Double proxyStart = null;

    Double proxyEnd = null;

    Double dnsStart = null;

    Double dnsEnd = null;

    Double connectStart = null;

    Double connectEnd = null;

    Double sslStart = null;

    Double sslEnd = null;

    Double workerStart = null;

    Double workerReady = null;

    Double sendStart = null;

    Double sendEnd = null;

    Double pushStart = null;

    Double pushEnd = null;

    Double receiveHeadersEnd = null;

    while (input.hasNext()) {
      switch (input.nextName()) {
        case "connectEnd":
          connectEnd = input.read(Double.class);
          break;
        case "connectStart":
          connectStart = input.read(Double.class);
          break;
        case "dnsEnd":
          dnsEnd = input.read(Double.class);
          break;
        case "dnsStart":
          dnsStart = input.read(Double.class);
          break;
        case "proxyEnd":
          proxyEnd = input.read(Double.class);
          break;
        case "proxyStart":
          proxyStart = input.read(Double.class);
          break;
        case "pushEnd":
          pushEnd = input.read(Double.class);
          break;
        case "pushStart":
          pushStart = input.read(Double.class);
          break;
        case "receiveHeadersEnd":
          receiveHeadersEnd = input.read(Double.class);
          break;
        case "requestTime":
          requestTime = input.read(Double.class);
          break;
        case "sendStart":
          sendStart = input.read(Double.class);
          break;
        case "sendEnd":
          sendEnd = input.read(Double.class);
          break;
        case "sslEnd":
          sslEnd = input.read(Double.class);
          break;
        case "sslStart":
          sslStart = input.read(Double.class);
          break;
        case "workerReady":
          workerReady = input.read(Double.class);
          break;
        case "workerStart":
          workerStart = input.read(Double.class);
          break;
        default:
          input.skipValue();
          break;
      }
    }

    return new ResourceTiming(requestTime, proxyStart, proxyEnd, dnsStart, dnsEnd, connectStart,
                              connectEnd, sslStart, sslEnd, workerStart, workerReady, sendStart,
                              sendEnd, pushStart, pushEnd, receiveHeadersEnd);
  }
}
