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

package org.openqa.selenium.grid;

/**
 * The Selenium Grid is composed of a number of moving pieces, all of which are
 * designed to be used either locally or across an HTTP boundary.
 * <p>
 * Sitting at the front of the system is the
 * {@link org.openqa.selenium.grid.router.Router}. This is responsible for
 * looking at incoming requests and routing them to the correct location. In the
 * case of a <a href="https://www.w3.org/TR/webdriver/#new-session"></a>New
 * Session</a> command, it will be sent to the
 * {@link org.openqa.selenium.grid.distributor.Distributor}.
 * <p>
 * The {@code Distributor} has a number of
 * {@link org.openqa.selenium.grid.node.Node}s associated with it, each of which
 * is capable of running one or more {@link org.openqa.selenium.grid.data.Session}s
 * which may or may not be running in memory. Each {@code Node} should register
 * with a single {@code Distributor}.
 * <p>
 * When a new session is started, the {@code Node} tells the
 * {@link org.openqa.selenium.grid.sessionmap.SessionMap} where the {@code Session}
 * (identified by its {@link org.openqa.selenium.remote.SessionId} can be
 * located (typically the URL of the server on which the {@code Node} is running.
 * Conversely, when the session comes to an end, the {@code Node} is responsible
 * for ensuring that the session is removed from the {@code SessionMap}.
 */