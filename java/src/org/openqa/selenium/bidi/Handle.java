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

package org.openqa.selenium.bidi;

import java.util.function.Consumer;

/**
 * An opaque handle to the active BiDi connection, used by {@link Module} subclasses to send
 * commands and subscribe to events.
 *
 * <p>Constructor and all methods are package-private: external callers that hold a {@code Handle}
 * reference cannot invoke it, only pass it to module constructors inside this package. Create an
 * instance via {@link BiDi#asHandle()}.
 */
public class Handle {

  private final BiDi bidi;

  Handle(BiDi bidi) {
    this.bidi = bidi;
  }

  <X> X send(Command<X> command) {
    return bidi.send(command);
  }

  <X> long subscribe(Event<X> event, Consumer<X> handler) {
    return bidi.addListener(event, handler);
  }

  // TODO: This clears every listener for the event, not just the one added by subscribe() above,
  // since BiDi.removeListener(long) does not send session.unsubscribe on the wire.
  // Revisit once per-subscription unsubscribe is wired up correctly.
  <X> void unsubscribe(Event<X> event) {
    bidi.clearListener(event);
  }
}
