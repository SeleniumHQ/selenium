// <copyright file="V113Target.cs" company="WebDriver Committers">
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

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium.DevTools.V113.Target;

namespace OpenQA.Selenium.DevTools.V113
{
    /// <summary>
    /// Class providing functionality for manipulating targets for version 113 of the DevTools Protocol
    /// </summary>
    public class V113Target : DevTools.Target
    {
        private TargetAdapter adapter;

        /// <summary>
        /// Initializes a new instance of the <see cref="V113Target"/> class.
        /// </summary>
        /// <param name="adapter">The adapter for the Target domain.</param>
        public V113Target(TargetAdapter adapter)
        {
            this.adapter = adapter;
            adapter.DetachedFromTarget += OnDetachedFromTarget;
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
            var response = await adapter.GetTargets((GetTargetsCommandSettings) settings);
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
            var result = await adapter.AttachToTarget(new AttachToTargetCommandSettings() { TargetId = targetId, Flatten = true });
            return result.SessionId;
        }

        /// <summary>
        /// Asynchronously detaches from a target.
        /// </summary>
        /// <param name="sessionId">The ID of the session of the target from which to detach.</param>
        /// <param name="targetId">The ID of the target from which to detach.</param>
        /// <returns>
        /// A task representing the asynchronous detach operation.
        public override async Task DetachFromTarget(string sessionId = null, string targetId = null)
        {
            await adapter.DetachFromTarget(new DetachFromTargetCommandSettings()
            {
                SessionId = sessionId,
                TargetId = targetId
            });
        }

        /// <summary>
        /// Asynchronously sets the DevTools Protocol connection to automatically attach to new targets.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public override async Task SetAutoAttach()
        {
            await adapter.SetAutoAttach(new SetAutoAttachCommandSettings() { AutoAttach = true, WaitForDebuggerOnStart = false, Flatten = true });
        }

        private void OnDetachedFromTarget(object sender, DetachedFromTargetEventArgs e)
        {
            this.OnTargetDetached(new TargetDetachedEventArgs() { SessionId = e.SessionId, TargetId = e.TargetId });
        }
    }
}
