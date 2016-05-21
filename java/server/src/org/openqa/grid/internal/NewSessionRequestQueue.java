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

package org.openqa.grid.internal;

import com.google.common.base.Predicate;

import net.jcip.annotations.ThreadSafe;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.logging.Logger;

/**
 * The queue of all incoming "new session" requests to the grid.
 *
 * Currently still uses the readerwriterlock/condition model that is used in the
 * Registry and is tightly coupled to the registry
 */
@ThreadSafe
class NewSessionRequestQueue {

  private static final Logger log = Logger.getLogger(NewSessionRequestQueue.class.getName());

  private final List<RequestHandler> newSessionRequests = new ArrayList<>();


  /**
   * Adds a request handler to this queue.
   * @param request the RequestHandler to add
   */
  public synchronized void add(RequestHandler request) {
    newSessionRequests.add(request);
  }

  /**
   * Processes all the entries in this queue.
   *
   * @param handlerConsumer The consumer that returns true if it has taken the item from the queue
   * @param prioritizer     The prioritizer to use
   */

  public synchronized void processQueue(Predicate<RequestHandler> handlerConsumer,
                                        Prioritizer prioritizer) {

    final List<RequestHandler> copy;
    if (prioritizer != null) {
      copy = new ArrayList<>(newSessionRequests);
      Collections.sort(copy);
    } else {
      copy = newSessionRequests;
    }

    List<RequestHandler> matched = new ArrayList<>();
    for (RequestHandler request : copy) {
      if (handlerConsumer.apply(request)) {
        matched.add(request);
      }
    }
    for (RequestHandler req : matched) {
      boolean ok = removeNewSessionRequest(req);
      if (!ok) {
        log.severe("Bug removing request " + req);
      }
    }
  }

  /**
   * clear the entire list of requests
   */
  public synchronized void clearNewSessionRequests() {
    newSessionRequests.clear();
  }

  /**
   * Remove a specific request
   * @param request The request to remove
   * @return A boolean result from doing a newSessionRequest.remove(request).
   */
  public synchronized boolean removeNewSessionRequest(RequestHandler request) {
    return newSessionRequests.remove(request);
  }

  /**
   * Provides the desired capabilities of all the items in this queue.
   *
   * @return An Iterable of unmodifiable maps.
   */
  public synchronized Iterable<DesiredCapabilities> getDesiredCapabilities() {
    List<DesiredCapabilities> result = new ArrayList<>();
    for (RequestHandler req : newSessionRequests) {
      result.add(new DesiredCapabilities(req.getRequest().getDesiredCapabilities()));
    }
    return result;
  }

  /**
   * Returns the number of unprocessed items in this request queue.
   * @return the size of the queue
   */
  public synchronized int getNewSessionRequestCount() {
    return newSessionRequests.size();
  }

  public synchronized void stop() {
    for (RequestHandler newSessionRequest : newSessionRequests) {
      newSessionRequest.stop();
    }
  }
}
