// <copyright file="V129Target.cs" company="WebDriver Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements. See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership. The SFC licenses this file
// to you under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// </copyright>

using OpenQA.Selenium.DevTools.V129.Target;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools.V129
{
    /// <summary>
    /// Class providing functionality for manipulating targets for version 129 of the DevTools Protocol
    /// </summary>
    public class V129Target : DevTools.Target
    {
        private TargetAdapter adapter;

        /// <summary>
        /// Initializes a new instance of the <see cref="V129Target"/> class.
        /// </summary>
        /// <param name="adapter">The adapter for the Target domain.</param>
        public V129Target(TargetAdapter adapter)
        {
            this.adapter = adapter;
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
        public override async Task<ReadOnlyCollection<TargetInfo>> GetTargets(Object settings = null)

        {
            List<TargetInfo> targets = new List<TargetInfo>();
            if (settings == null)
            {
                settings = new GetTargetsCommandSettings();
            }
            var response = await adapter.GetTargets((GetTargetsCommandSettings)settings).ConfigureAwait(false);
            for (int i = 0; i < response.TargetInfos.Length; i++)
            {
                var targetInfo = response.TargetInfos[i];
                var mapped = new TargetInfo()
                {
                    TargetId = targetInfo.TargetId,
                    Title = targetInfo.Title,
                    Type = targetInfo.Type,
                    Url = targetInfo.Url,
                    OpenerId = targetInfo.OpenerId,
                    BrowserContextId = targetInfo.BrowserContextId,
                    IsAttached = targetInfo.Attached
                };
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
        public override async Task DetachFromTarget(string sessionId = null, string targetId = null)
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

        private void OnDetachedFromTarget(object sender, DetachedFromTargetEventArgs e)
        {
            this.OnTargetDetached(new TargetDetachedEventArgs() { SessionId = e.SessionId, TargetId = e.TargetId });
        }

        private void OnAttachedToTarget(object sender, AttachedToTargetEventArgs e)
        {
            this.OnTargetAttached(new TargetAttachedEventArgs()
            {
                SessionId = e.SessionId,
                TargetInfo = e.TargetInfo == null ? null : new TargetInfo
                {
                    BrowserContextId = e.TargetInfo.BrowserContextId,
                    IsAttached = e.TargetInfo.Attached,
                    OpenerId = e.TargetInfo.OpenerId,
                    TargetId = e.TargetInfo.TargetId,
                    Title = e.TargetInfo.Title,
                    Type = e.TargetInfo.Type,
                    Url = e.TargetInfo.Url
                },
                WaitingForDebugger = e.WaitingForDebugger
            });
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
}
