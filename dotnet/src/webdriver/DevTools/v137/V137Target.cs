// <copyright file="V137Target.cs" company="Selenium Committers">
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

using OpenQA.Selenium.DevTools.V137.Target;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools.V137;

/// <summary>
/// Class providing functionality for manipulating targets for version 137 of the DevTools Protocol
/// </summary>
public class V137Target : DevTools.Target
{
    private readonly TargetAdapter adapter;

    /// <summary>
    /// Initializes a new instance of the <see cref="V137Target"/> class.
    /// </summary>
    /// <param name="adapter">The adapter for the Target domain.</param>
    /// <exception cref="ArgumentNullException">If <paramref name="adapter"/> is <see langword="null"/>.</exception>
    public V137Target(TargetAdapter adapter)
    {
        this.adapter = adapter ?? throw new ArgumentNullException(nameof(adapter));
        adapter.DetachedFromTarget += OnDetachedFromTarget;
        adapter.AttachedToTarget += OnAttachedToTarget;
    }

    /// <summary>
    /// Asynchronously gets the targets available for this session.
    /// </summary>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result
    /// contains the list of <see cref="TargetInfo"/> objects describing the
    /// targets available for this session.
    /// </returns>
    public override async Task<ReadOnlyCollection<TargetInfo>> GetTargets(object? settings = null)
    {
        settings ??= new GetTargetsCommandSettings();

        var response = await adapter.GetTargets((GetTargetsCommandSettings)settings).ConfigureAwait(false);

        List<TargetInfo> targets = new List<TargetInfo>(response.TargetInfos.Length);
        for (int i = 0; i < response.TargetInfos.Length; i++)
        {
            var targetInfo = response.TargetInfos[i];
            var mapped = new TargetInfo
            (
                targetId: targetInfo.TargetId,
                title: targetInfo.Title,
                type: targetInfo.Type,
                url: targetInfo.Url,
                openerId: targetInfo.OpenerId,
                browserContextId: targetInfo.BrowserContextId,
                isAttached: targetInfo.Attached
            );
            targets.Add(mapped);
        }

        return targets.AsReadOnly();
    }

    /// <summary>
    /// Asynchronously attaches to a target.
    /// </summary>
    /// <param name="targetId">The ID of the target to which to attach.</param>
    /// <returns>
    /// A task representing the asynchronous attach operation. The task result contains the
    /// session ID established for commands to the target attached to.
    /// </returns>
    public override async Task<string> AttachToTarget(string targetId)
    {
        var result = await adapter.AttachToTarget(new AttachToTargetCommandSettings() { TargetId = targetId, Flatten = true }).ConfigureAwait(false);
        return result.SessionId;
    }

    /// <summary>
    /// Asynchronously detaches from a target.
    /// </summary>
    /// <param name="sessionId">The ID of the session of the target from which to detach.</param>
    /// <param name="targetId">The ID of the target from which to detach.</param>
    /// <returns>A task representing the asynchronous detach operation.</returns>
    public override async Task DetachFromTarget(string? sessionId = null, string? targetId = null)
    {
        await adapter.DetachFromTarget(new DetachFromTargetCommandSettings()
        {
            SessionId = sessionId,
            TargetId = targetId
        }).ConfigureAwait(false);
    }

    /// <summary>
    /// Asynchronously sets the DevTools Protocol connection to automatically attach to new targets.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation.</returns>
    public override async Task SetAutoAttach()
    {
        await adapter.SetAutoAttach(new SetAutoAttachCommandSettings() { AutoAttach = true, WaitForDebuggerOnStart = false, Flatten = true }).ConfigureAwait(false);
    }

    private void OnDetachedFromTarget(object? sender, DetachedFromTargetEventArgs e)
    {
        this.OnTargetDetached(new TargetDetachedEventArgs(e.SessionId, e.TargetId));
    }

    private void OnAttachedToTarget(object? sender, AttachedToTargetEventArgs e)
    {
        var targetInfo = e.TargetInfo == null ? null : new TargetInfo
        (
            browserContextId: e.TargetInfo.BrowserContextId,
            isAttached: e.TargetInfo.Attached,
            openerId: e.TargetInfo.OpenerId,
            targetId: e.TargetInfo.TargetId,
            title: e.TargetInfo.Title,
            type: e.TargetInfo.Type,
            url: e.TargetInfo.Url
        );

        this.OnTargetAttached(new TargetAttachedEventArgs
        (
            sessionId: e.SessionId,
            targetInfo: targetInfo,
            waitingForDebugger: e.WaitingForDebugger
        ));
    }

    internal override ICommand CreateSetAutoAttachCommand(bool waitForDebuggerOnStart)
    {
        return new SetAutoAttachCommandSettings
        {
            AutoAttach = true,
            Flatten = true,
            WaitForDebuggerOnStart = waitForDebuggerOnStart
        };
    }

    internal override ICommand CreateDiscoverTargetsCommand()
    {
        return new SetDiscoverTargetsCommandSettings
        {
            Discover = true
        };
    }
}
