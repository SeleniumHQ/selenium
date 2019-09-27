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

import com.google.common.collect.Ordering;

import net.jcip.annotations.ThreadSafe;

import org.openqa.grid.internal.listeners.Prioritizer;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Predicate;
import java.util.logging.Logger;
import java.util.stream.Collectors;

/**
 * The queue of all incoming "new session" requests to the grid.
 *
 * Currently still uses the readerwriterlock/condition model that is used in the
 * GridRegistry and is tightly coupled to the registry
 */
@ThreadSafe
public class NewSessionRequestQueue {

  private static final Logger log = Logger.getLogger(NewSessionRequestQueue.class.getName());

  private final ReadWriteLock lock = new ReentrantReadWriteLock(true);
  private final List<RequestHandler> newSessionRequests = new ArrayList<>();

  /**
   * Adds a request handler to this queue.
   * @param request the RequestHandler to add
   */
  public void add(RequestHandler request) {
    lock.writeLock().lock();
    try {
      newSessionRequests.add(request);
    } finally {
      lock.writeLock().unlock();
    }
  }

  /**
   * Processes all the entries in this queue.
   *
   * @param handlerConsumer The consumer that returns true if it has taken the item from the queue
   * @param prioritizer     The prioritizer to use
   */

  public void processQueue(
      Predicate<RequestHandler> handlerConsumer,
      Prioritizer prioritizer) {

    Comparator<RequestHandler> comparator =
        prioritizer == null ?
        Ordering.allEqual()::compare :
        (a, b) -> prioritizer.compareTo(
            a.getRequest().getDesiredCapabilities(), b.getRequest().getDesiredCapabilities());

    lock.writeLock().lock();
    try {

      newSessionRequests.stream()
          .sorted(comparator)
          .filter(handlerConsumer)
          .forEach(requestHandler -> {
            if (!removeNewSessionRequest(requestHandler)) {
              log.severe("Bug removing request " + requestHandler);
            }
          });
    } finally {
      lock.writeLock().unlock();
    }
  }

  /**
   * clear the entire list of requests
   */
  public void clearNewSessionRequests() {
    lock.writeLock().lock();
    try {
      newSessionRequests.clear();
    } finally {
      lock.writeLock().unlock();
    }
  }

  /**
   * Remove a specific request
   * @param request The request to remove
   * @return A boolean result from doing a newSessionRequest.remove(request).
   */
  public boolean removeNewSessionRequest(RequestHandler request) {
    lock.writeLock().lock();
    try {
      return newSessionRequests.remove(request);
    } finally {
      lock.writeLock().unlock();
    }
  }

  /**
   * Provides the desired capabilities of all the items in this queue.
   *
   * @return An Iterable of unmodifiable maps.
   */
  public Iterable<DesiredCapabilities> getDesiredCapabilities() {
    lock.readLock().lock();
    try {
      return newSessionRequests.stream()
          .map(req -> new DesiredCapabilities(req.getRequest().getDesiredCapabilities()))
          .collect(Collectors.toList());
    } finally {
      lock.readLock().unlock();
    }
  }

  /**
   * Returns the number of unprocessed items in this request queue.
   * @return the size of the queue
   */
  public int getNewSessionRequestCount() {
    lock.readLock().lock();
    try {
      return newSessionRequests.size();
    } finally {
      lock.readLock().unlock();
    }
  }

  public void stop() {
    lock.writeLock().lock();
    try {
      newSessionRequests.forEach(RequestHandler::stop);
    } finally {
      lock.writeLock().unlock();
    }
  }
}
