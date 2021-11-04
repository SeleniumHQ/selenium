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


/**
 * The {@link org.openqa.selenium.grid.distributor.Distributor} is responsible
 * for assigning new calls to Create Session to a
 * {@link org.openqa.selenium.grid.node.Node}. It's possible that the first
 * attempt to create a session fails for any number of reasons, and so a
 * well-behaved implementation will continue trying additional nodes until
 * either a session starts or nothing is successful.
 * <p>
 * To complicate matters, local ends may send a session request that is one of
 * two different dialects (presumably in the future there may be more. *sigh*)
 * and care must be taken to ensure that dialects match, or that a converter
 * of some sort is added. The Node may be the part of the system responsible
 * for adding this converter.
 */
package org.openqa.selenium.grid.distributor;
