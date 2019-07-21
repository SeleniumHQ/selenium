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

import static java.util.Objects.requireNonNull;

import org.openqa.selenium.json.JsonInput;

/**
 * Timing information for the request
 */
public class ResourceTiming {

  private Double requestTime;

  private Double proxyStart;

  private Double proxyEnd;

  private Double dnsStart;

  private Double dnsEnd;

  private Double connectStart;

  private Double connectEnd;

  private Double sslStart;

  private Double sslEnd;

  private Double workerStart;

  private Double workerReady;

  private Double sendStart;

  private Double sendEnd;

  private Double pushStart;

  private Double pushEnd;

  private Double receiveHeadersEnd;

  public ResourceTiming(Double requestTime, Double proxyStart, Double proxyEnd,
                        Double dnsStart, Double dnsEnd, Double connectStart,
                        Double connectEnd, Double sslStart, Double sslEnd,
                        Double workerStart, Double workerReady, Double sendStart,
                        Double sendEnd, Double pushStart, Double pushEnd,
                        Double receiveHeadersEnd) {
    this.requestTime = requireNonNull(requestTime, "'requestTime' is required for ResourceTiming");
    this.proxyStart = requireNonNull(proxyStart, "'proxyStart' is required for ResourceTiming");
    this.proxyEnd = requireNonNull(proxyEnd, "'proxyEnd' is required for ResourceTiming");
    this.dnsStart = requireNonNull(dnsStart, "'dnsStart' is required for ResourceTiming");
    this.dnsEnd = requireNonNull(dnsEnd, "'dnsEnd' is required for ResourceTiming");
    this.connectStart =
        requireNonNull(connectStart, "'connectStart' is required for ResourceTiming");
    this.connectEnd = requireNonNull(connectEnd, "'connectEnd' is required for ResourceTiming");
    this.sslStart = requireNonNull(sslStart, "'sslStart' is required for ResourceTiming");
    this.sslEnd = requireNonNull(sslEnd, "'sslEnd' is required for ResourceTiming");
    this.workerStart = workerStart;
    this.workerReady = workerReady;
    this.sendStart = requireNonNull(sendStart, "'sendStart' is required for ResourceTiming");
    this.sendEnd = requireNonNull(sendEnd, "'sendEnd' is required for ResourceTiming");
    this.pushStart = pushStart;
    this.pushEnd = pushEnd;
    this.receiveHeadersEnd =
        requireNonNull(receiveHeadersEnd, "'receiveHeadersEnd' is required for ResourceTiming");
  }

  /**
   * Timing's requestTime is a baseline in seconds, while the other numbers are ticks in
   * milliseconds relatively to this requestTime.
   */
  public Double getRequestTime() {
    return requestTime;
  }

  /**
   * Timing's requestTime is a baseline in seconds, while the other numbers are ticks in
   * milliseconds relatively to this requestTime.
   */
  public void setRequestTime(Double requestTime) {
    this.requestTime = requestTime;
  }

  /** Started resolving proxy. */
  public Double getProxyStart() {
    return proxyStart;
  }

  /** Started resolving proxy. */
  public void setProxyStart(Double proxyStart) {
    this.proxyStart = proxyStart;
  }

  /** Finished resolving proxy. */
  public Double getProxyEnd() {
    return proxyEnd;
  }

  /** Finished resolving proxy. */
  public void setProxyEnd(Double proxyEnd) {
    this.proxyEnd = proxyEnd;
  }

  /** Started DNS address resolve. */
  public Double getDnsStart() {
    return dnsStart;
  }

  /** Started DNS address resolve. */
  public void setDnsStart(Double dnsStart) {
    this.dnsStart = dnsStart;
  }

  /** Finished DNS address resolve. */
  public Double getDnsEnd() {
    return dnsEnd;
  }

  /** Finished DNS address resolve. */
  public void setDnsEnd(Double dnsEnd) {
    this.dnsEnd = dnsEnd;
  }

  /** Started connecting to the remote host. */
  public Double getConnectStart() {
    return connectStart;
  }

  /** Started connecting to the remote host. */
  public void setConnectStart(Double connectStart) {
    this.connectStart = connectStart;
  }

  /** Connected to the remote host. */
  public Double getConnectEnd() {
    return connectEnd;
  }

  /** Connected to the remote host. */
  public void setConnectEnd(Double connectEnd) {
    this.connectEnd = connectEnd;
  }

  /** Started SSL handshake. */
  public Double getSslStart() {
    return sslStart;
  }

  /** Started SSL handshake. */
  public void setSslStart(Double sslStart) {
    this.sslStart = sslStart;
  }

  /** Finished SSL handshake. */
  public Double getSslEnd() {
    return sslEnd;
  }

  /** Finished SSL handshake. */
  public void setSslEnd(Double sslEnd) {
    this.sslEnd = sslEnd;
  }

  /** Started running ServiceWorker. */
  public Double getWorkerStart() {
    return workerStart;
  }

  /** Started running ServiceWorker. */
  public void setWorkerStart(Double workerStart) {
    this.workerStart = workerStart;
  }

  /** Finished Starting ServiceWorker. */
  public Double getWorkerReady() {
    return workerReady;
  }

  /** Finished Starting ServiceWorker. */
  public void setWorkerReady(Double workerReady) {
    this.workerReady = workerReady;
  }

  /** Started sending request. */
  public Double getSendStart() {
    return sendStart;
  }

  /** Started sending request. */
  public void setSendStart(Double sendStart) {
    this.sendStart = sendStart;
  }

  /** Finished sending request. */
  public Double getSendEnd() {
    return sendEnd;
  }

  /** Finished sending request. */
  public void setSendEnd(Double sendEnd) {
    this.sendEnd = sendEnd;
  }

  /** Time the server started pushing request. */
  public Double getPushStart() {
    return pushStart;
  }

  /** Time the server started pushing request. */
  public void setPushStart(Double pushStart) {
    this.pushStart = pushStart;
  }

  /** Time the server finished pushing request. */
  public Double getPushEnd() {
    return pushEnd;
  }

  /** Time the server finished pushing request. */
  public void setPushEnd(Double pushEnd) {
    this.pushEnd = pushEnd;
  }

  /** Finished receiving response headers. */
  public Double getReceiveHeadersEnd() {
    return receiveHeadersEnd;
  }

  /** Finished receiving response headers. */
  public void setReceiveHeadersEnd(Double receiveHeadersEnd) {
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
        case "requestTime":
          requestTime = input.read(Double.class);
          break;
        case "proxyStart":
          proxyStart = input.read(Double.class);
          break;
        case "proxyEnd":
          proxyEnd = input.read(Double.class);
          break;
        case "dnsStart":
          dnsStart = input.read(Double.class);
          break;
        case "dnsEnd":
          dnsEnd = input.read(Double.class);
          break;
        case "connectStart":
          connectStart = input.read(Double.class);
          break;
        case "connectEnd":
          connectEnd = input.read(Double.class);
          break;
        case "sslStart":
          sslStart = input.read(Double.class);
          break;
        case "sslEnd":
          sslEnd = input.read(Double.class);
          break;
        case "workerStart":
          workerStart = input.read(Double.class);
          break;
        case "workerReady":
          workerReady = input.read(Double.class);
          break;
        case "sendStart":
          sendStart = input.read(Double.class);
          break;
        case "sendEnd":
          sendEnd = input.read(Double.class);
          break;
        case "pushStart":
          pushStart = input.read(Double.class);
          break;
        case "pushEnd":
          pushEnd = input.read(Double.class);
          break;
        case "receiveHeadersEnd":
          receiveHeadersEnd = input.read(Double.class);
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
