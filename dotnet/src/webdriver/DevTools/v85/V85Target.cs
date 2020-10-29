// <copyright file="V85Target.cs" company="WebDriver Committers">
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
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium.DevTools.V85.Target;

namespace OpenQA.Selenium.DevTools.V85
{
    /// <summary>
    /// Class providing functionality for manipulating targets for version 85 of the DevTools Protocol
    /// </summary>
    public class V85Target : ITarget
    {
        private TargetAdapter adapter;

        /// <summary>
        /// Initializes a new instance of the <see cref="V85Target"/> class.
        /// </summary>
        /// <param name="adapter">The adapter for the Target domain.</param>
        public V85Target(TargetAdapter adapter)
        {
            this.adapter = adapter;
        }

        /// <summary>
        /// Asynchronously gets the targets available for this session.
        /// </summary>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result
        /// contains the list of <see cref="TargetInfo"/> objects describing the
        /// targets available for this session.
        /// </returns>
        public async Task<List<TargetInfo>> GetTargets()
        {
            List<TargetInfo> targets = new List<TargetInfo>();
            var response = await adapter.GetTargets();
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

            return targets;
        }

        /// <summary>
        /// Asynchronously attaches to a target.
        /// </summary>
        /// <param name="targetId">The ID of the target to which to attach.</param>
        /// <returns>
        /// A task representing the asynchronous attach operation. The task result contains the
        /// session ID established for commands to the target attached to.
        /// </returns>
        public async Task<string> AttachToTarget(string targetId)
        {
            var result = await adapter.AttachToTarget(new AttachToTargetCommandSettings() { TargetId = targetId, Flatten = true });
            return result.SessionId;
        }

        /// <summary>
        /// Asynchronously sets the DevTools Protocol connection to automatically attach to new targets.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public async Task SetAutoAttach()
        {
            await adapter.SetAutoAttach(new SetAutoAttachCommandSettings() { AutoAttach = true, WaitForDebuggerOnStart = false, Flatten = true });
        }
    }
}
