// <copyright file="TargetAttachedEventArgs.cs" company="Selenium Committers">
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
// </copyright>

using System;

namespace OpenQA.Selenium.DevTools;

/// <summary>
/// Event arguments present when the TargetAttached event is raised.
/// </summary>
public class TargetAttachedEventArgs : EventArgs
{
    /// <summary>
    /// Initializes a new instance of the <see cref="TargetAttachedEventArgs"/> type.
    /// </summary>
    /// <param name="sessionId">The ID of the session of the target attached.</param>
    /// <param name="targetInfo">The target which is attached.</param>
    /// <param name="waitingForDebugger">If the target is waiting on the debugger. Target continues after invoking <c>Runtime.runIfWaitingForDebugger</c>.</param>
    public TargetAttachedEventArgs(string sessionId, TargetInfo? targetInfo, bool waitingForDebugger)
    {
        SessionId = sessionId;
        TargetInfo = targetInfo;
        WaitingForDebugger = waitingForDebugger;
    }

    /// <summary>
    /// Gets the ID of the session of the target attached.
    /// </summary>
    public string SessionId { get; }

    /// <summary>
    /// Gets the target which is attached.
    /// </summary>
    public TargetInfo? TargetInfo { get; }

    /// <summary>
    /// Gets if the target is waiting on the debugger. Target continues after invoking <c>Runtime.runIfWaitingForDebugger</c>.
    /// </summary>
    public bool WaitingForDebugger { get; }
}
