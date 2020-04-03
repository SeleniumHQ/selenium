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

package org.openqa.selenium.grid.distributor.local;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import io.opentelemetry.context.Scope;
import io.opentelemetry.trace.Span;
import io.opentelemetry.trace.Tracer;
import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.concurrent.Regularly;
import org.openqa.selenium.events.EventBus;
import org.openqa.selenium.grid.data.*;
import org.openqa.selenium.grid.distributor.Distributor;
import org.openqa.selenium.grid.node.Node;
import org.openqa.selenium.grid.node.remote.RemoteNode;
import org.openqa.selenium.grid.sessionmap.SessionMap;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.NewSessionPayload;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;

import java.io.IOException;
import java.io.Reader;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.function.Supplier;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static com.google.common.collect.ImmutableSet.toImmutableSet;
import static org.openqa.selenium.grid.data.NodeStatusEvent.NODE_STATUS;
import static org.openqa.selenium.grid.distributor.local.Host.Status.UP;
import static org.openqa.selenium.remote.RemoteTags.CAPABILITIES;
import static org.openqa.selenium.remote.RemoteTags.SESSION_ID;
import static org.openqa.selenium.remote.http.Contents.reader;
import static org.openqa.selenium.remote.tracing.HttpTracing.newSpanAsChildOf;

public class LocalDistributor extends Distributor {

  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger("Selenium Distributor (Local)");
  private final ReadWriteLock lock = new ReentrantReadWriteLock(/* fair */ true);
  private final Set<Host> hosts = new HashSet<>();
  private final Tracer tracer;
  private final EventBus bus;
  private final HttpClient.Factory clientFactory;
  private final SessionMap sessions;
  private final Regularly hostChecker = new Regularly("distributor host checker");
  private final Map<UUID, Collection<Runnable>> allChecks = new ConcurrentHashMap<>();
  private final String registrationSecret;

  public LocalDistributor(
      Tracer tracer,
      EventBus bus,
      HttpClient.Factory clientFactory,
      SessionMap sessions,
      String registrationSecret) {
    super(tracer, clientFactory);
    this.tracer = Objects.requireNonNull(tracer);
    this.bus = Objects.requireNonNull(bus);
    this.clientFactory = Objects.requireNonNull(clientFactory);
    this.sessions = Objects.requireNonNull(sessions);
    this.registrationSecret = registrationSecret;

    bus.addListener(NODE_STATUS, event -> refresh(event.getData(NodeStatus.class)));
  }

  @Override
  public CreateSessionResponse newSession(HttpRequest request)
      throws SessionNotCreatedException {
    Span span = newSpanAsChildOf(tracer, request, "distributor.new_session").startSpan();

    try (
      Scope scope = tracer.withSpan(span);
      Reader reader = reader(request);
      NewSessionPayload payload = NewSessionPayload.create(reader)) {
      Objects.requireNonNull(payload, "Requests to process must be set.");

      Iterator<Capabilities> iterator = payload.stream().iterator();

      if (!iterator.hasNext()) {
        throw new SessionNotCreatedException("No capabilities found");
      }

      Optional<Supplier<CreateSessionResponse>> selected;
      CreateSessionRequest firstRequest = new CreateSessionRequest(
          payload.getDownstreamDialects(),
          iterator.next(),
          ImmutableMap.of());

      Lock writeLock = this.lock.writeLock();
      writeLock.lock();
      try {
        Stream<Host> firstRound = this.hosts.stream()
            .filter(host -> host.getHostStatus() == UP)
            // Find a host that supports this kind of thing
            .filter(host -> host.hasCapacity(firstRequest.getCapabilities()));

        //of the hosts that survived the first round, separate into buckets and prioritize by browser "rarity"
        Stream<Host> prioritizedHosts = getPrioritizedHostStream(firstRound, firstRequest.getCapabilities());

        //Take the further-filtered Stream and prioritize by load, then by session age
        selected = prioritizedHosts
            .min(
                // Now sort by node which has the lowest load (natural ordering)
                Comparator.comparingDouble(Host::getLoad)
                    // Then last session created (oldest first), so natural ordering again
                    .thenComparingLong(Host::getLastSessionCreated)
                    // And use the host id as a tie-breaker.
                    .thenComparing(Host::getId))
            // And reserve some space for this session
            .map(host -> host.reserve(firstRequest));
      } finally {
        writeLock.unlock();
      }

      CreateSessionResponse sessionResponse = selected
          .orElseThrow(
              () -> {
                span.setAttribute("error", true);
                return new SessionNotCreatedException(
                  "Unable to find provider for session: " + payload.stream()
                    .map(Capabilities::toString)
                    .collect(Collectors.joining(", ")));
              })
          .get();

      sessions.add(sessionResponse.getSession());

      SESSION_ID.accept(span, sessionResponse.getSession().getId());
      CAPABILITIES.accept(span, sessionResponse.getSession().getCapabilities());
      span.setAttribute("session.url", sessionResponse.getSession().getUri().toString());

      return sessionResponse;
    } catch (IOException e) {
      span.setAttribute("error", true);
      throw new SessionNotCreatedException(e.getMessage(), e);
    } finally {
      span.end();
    }
  }

  /**
   * Takes a Stream of Hosts, along with the Capabilities of the current request, and prioritizes the
   * request by removing Hosts that offer Capabilities that are more rare. e.g. if there are only a
   * couple Edge nodes, but a lot of Chrome nodes, the Edge nodes should be removed from
   * consideration when Chrome is requested. This does not currently take the amount of load on the
   * server into consideration--it only checks for availability, not how much availability
   * @param hostStream Stream of hosts attached to the Distributor (assume it's filtered for only those that offer these Capabilities)
   * @param capabilities Passing in the whole Capabilities object will allow us to prioritize more than just browser
   * @return Stream of distinct Hosts with the more rare Capabilities removed
   */
  @VisibleForTesting
  Stream<Host> getPrioritizedHostStream(Stream<Host> hostStream, Capabilities capabilities) {
    //TODO for the moment, we're not going to operate on the Stream that was passed in--we need to
    // alter and futz with the contents, so the stream isn't the right place to operate. This
    // will likely be optimized back into the algo, but not yet
    Set<Host> filteredHostSet = hostStream.collect(Collectors.toSet());

    //A "bucket" is a list of hosts that can use a particular browser. The "edge" bucket is the
    // complete list of Hosts that support "edge". By separating Hosts into buckets, we will
    // know which browsers have fewer nodes available for the browsers we're not interested in, and
    // can prioritize based on the browsers that have more availability
    Map<String, Set<Host>> hostBuckets = sortHostsToBucketsByBrowser(filteredHostSet);

    //First, check to see if all buckets are the same size. If they are, just send back the full list of hosts
    // (i.e. the hosts are all "balanced" with regard to browser priority)
    if (allBucketsSameSize(hostBuckets)) {
      return hostBuckets.values().stream().distinct().flatMap(Set::stream);
    }

    //Then, starting with the smallest bucket that isn't the current browser being prioritized,
    // remove all hosts in that bucket from consideration, then rebuild the buckets. Then do the
    // "same size" check again, and keep doing this until either a) there is only one bucket, or b)
    // all buckets are the same size

    //Note: there should never be a case where a bucket will have *more* nodes available for the
    // given browser than the one being requested. The first filter in this check looks for
    // "equal", not "equal-or-greater" as a result of this assumption

    //There might be unforeseen cases that challenge this assumption. TODO Create unit tests to prove it

    //TODO a List of Map.Entry is silly. whatever this structure needs to be needs to be returned by
    // the sortHostsToBucketsByBrowser method in a way that we don't have to sort it separately like this
    final List<Map.Entry<String, Set<Host>>> sorted = hostBuckets.entrySet().stream().sorted(
        Comparator.comparingInt(v -> v.getValue().size())
    ).collect(Collectors.toList());

    // Until the buckets are the same size, keep removing hosts that have more "rare" browser capabilities
    Map<String, Set<Host>> newHostBuckets;
    for (Map.Entry<String, Set<Host>> entry: sorted) {
      //Don't examine the bucket containing the browser in question--we're prioritizing the other browsers
      //TODO This shouldn't be necessary, because if the list is sorted by size, this won't be possible until
      // they're all the same size. Create a unit test to prove it
      if (entry.getKey().equals(capabilities.getBrowserName())) {
        continue;
      }

      //Remove all hosts from this bucket from the full set of eligible hosts
      final Set<Host> filteredHosts = filteredHostSet.stream().filter(host -> !entry.getValue().contains(host)).collect(Collectors.toSet());

      //Rebuild the buckets by browser
      newHostBuckets = sortHostsToBucketsByBrowser(filteredHosts);

      //Check the bucket sizes--if they're the same, then we're done
      if (allBucketsSameSize(newHostBuckets)) {
        LOG.fine("Hosts have been balanced according to browser priority");
        return newHostBuckets.values().stream().distinct().flatMap(Set::stream);
      }
    }

    return hostBuckets.values().stream().distinct().flatMap(Set::stream);
  }

  @VisibleForTesting
  Map<String, Set<Host>> sortHostsToBucketsByBrowser(Set<Host> hostSet) {
    //Make a hash of browserType -> list of hosts that support it
    Map<String, Set<Host>> hostBuckets = new HashMap<>();
    hostSet.forEach(host -> host.asSummary().getStereotypes().forEach((k, v) -> {
      if (!hostBuckets.containsKey(k.getBrowserName())) {
        Set<Host> newSet = new HashSet<>();
        newSet.add(host);
        hostBuckets.put(k.getBrowserName(), newSet);
      }
      hostBuckets.get(k.getBrowserName()).add(host);
    }));
    return hostBuckets;
  }

  @VisibleForTesting
  boolean allBucketsSameSize(Map<String, Set<Host>> hostBuckets) {
    Set<Integer> intSet = new HashSet<>();
    hostBuckets.values().forEach(bucket ->  intSet.add(bucket.size()));
    return intSet.size() == 1;
  }

  private void refresh(NodeStatus status) {
    Objects.requireNonNull(status);

    LOG.fine("Refreshing: " + status.getUri());

    // check registrationSecret and stop processing if it doesn't match
    if (!Objects.equals(status.getRegistrationSecret(), registrationSecret)) {
      LOG.severe(String.format("Node at %s failed to send correct registration secret. Node NOT registered.", status.getUri()));
      bus.fire(new NodeRejectedEvent(status.getUri()));
      return;
    }

    // Iterate over the available nodes to find a match.
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      Optional<Host> existing = hosts.stream()
          .filter(host -> host.getId().equals(status.getNodeId()))
          .findFirst();

      if (existing.isPresent()) {
        // Modify the state
        LOG.fine("Modifying existing state");
        existing.get().update(status);
      } else {
        // No match made. Add a new host.
        LOG.info("Creating a new remote node for " + status.getUri());
        Node node = new RemoteNode(
            tracer,
            clientFactory,
            status.getNodeId(),
            status.getUri(),
            status.getStereotypes().keySet());
        add(node, status);
      }
    } finally {
      writeLock.unlock();
    }
  }

  @Override
  public LocalDistributor add(Node node) {
    return add(node, node.getStatus());
  }

  private LocalDistributor add(Node node, NodeStatus status) {
    StringBuilder sb = new StringBuilder();

    Lock writeLock = this.lock.writeLock();
    writeLock.lock();
    try (JsonOutput out = JSON.newOutput(sb)) {
      out.setPrettyPrint(false).write(node);

      Host host = new Host(bus, node);
      host.update(status);

      LOG.fine("Adding host: " + host.asSummary());
      hosts.add(host);

      LOG.info(String.format("Added node %s.", node.getId()));
      host.runHealthCheck();

      Runnable runnable = host::runHealthCheck;
      Collection<Runnable> nodeRunnables = allChecks.getOrDefault(node.getId(), new ArrayList<>());
      nodeRunnables.add(runnable);
      allChecks.put(node.getId(), nodeRunnables);
      hostChecker.submit(runnable, Duration.ofMinutes(5), Duration.ofSeconds(30));
    } catch (Throwable t) {
      LOG.log(Level.WARNING, "Unable to process host", t);
    } finally {
      writeLock.unlock();
      bus.fire(new NodeAddedEvent(node.getId()));
    }

    return this;
  }

  @Override
  public void remove(UUID nodeId) {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      hosts.removeIf(host -> nodeId.equals(host.getId()));
      allChecks.getOrDefault(nodeId, new ArrayList<>()).forEach(hostChecker::remove);
    } finally {
      writeLock.unlock();
      bus.fire(new NodeRemovedEvent(nodeId));
    }
  }

  @Override
  public DistributorStatus getStatus() {
    Lock readLock = this.lock.readLock();
    readLock.lock();
    try {
      ImmutableSet<DistributorStatus.NodeSummary> summaries = this.hosts.stream()
          .map(Host::asSummary)
          .collect(toImmutableSet());

      return new DistributorStatus(summaries);
    } finally {
      readLock.unlock();
    }
  }

  @VisibleForTesting
  @Beta
  public void refresh() {
    Lock writeLock = lock.writeLock();
    writeLock.lock();
    try {
      hosts.forEach(Host::runHealthCheck);
    } finally {
      writeLock.unlock();
    }
  }
}
