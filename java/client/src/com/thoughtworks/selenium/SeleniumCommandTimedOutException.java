/*
 * Copyright 2011 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.selenium;


/**
 * <p>
 * Thrown to indicate that the remote process failed to respond within a specified timeout.
 * </p>
 * 
 * <p>
 * This typically happens when the browser fails to call us back, but if the driver is using a proxy
 * or a CommandBridge, the remote driver may have failed to give us a new command in time.
 * </p>
 * 
 * <p>
 * When a SeleniumCommandTimedOutException is thrown, we have to assume that the command queue is
 * out-of-sync with the remote process (e.g. browser). When this happens, the browser should be
 * stopped (killed) and the queue should be flushed.
 * 
 * @author paul
 * 
 */
public class SeleniumCommandTimedOutException extends RuntimeException {}
