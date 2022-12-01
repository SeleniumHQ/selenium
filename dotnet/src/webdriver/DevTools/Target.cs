// <copyright file="Target.cs" company="WebDriver Committers">
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
using System.Collections.ObjectModel;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Class representing a target for DevTools Protocol commands
    /// </summary>
    public abstract class Target
    {
        /// <summary>
        /// Occurs when a target is detached.
        /// </summary>
        public event EventHandler<TargetDetachedEventArgs> TargetDetached;

        /// <summary>
        /// Asynchronously gets the targets available for this session.
        /// </summary>
        /// <returns>
        /// A task that represents the asynchronous operation. The task result
        /// contains the list of <see cref="TargetInfo"/> objects describing the
        /// targets available for this session.
        /// </returns>
        public abstract Task<ReadOnlyCollection<TargetInfo>> GetTargets(Object settings = null);

        /// <summary>
        /// Asynchronously attaches to a target.
        /// </summary>
        /// <param name="targetId">The ID of the target to which to attach.</param>
        /// <returns>
        /// A task representing the asynchronous attach operation. The task result contains the
        /// session ID established for commands to the target attached to.
        /// </returns>
        public abstract Task<string> AttachToTarget(string targetId);

        /// <summary>
        /// Asynchronously detaches from a target.
        /// </summary>
        /// <param name="sessionId">The ID of the session of the target from which to detach.</param>
        /// <param name="targetId">The ID of the target from which to detach.</param>
        /// <returns>
        /// A task representing the asynchronous detach operation.
        /// </returns>
        public abstract Task DetachFromTarget(string sessionId = null, string targetId = null);

        /// <summary>
        /// Asynchronously sets the DevTools Protocol connection to automatically attach to new targets.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation.</returns>
        public abstract Task SetAutoAttach();

        /// <summary>
        /// Raises the TargetDetached event.
        /// </summary>
        /// <param name="e">An <see cref="TargetDetachedEventArgs"/> that contains the event data.</param>
        protected virtual void OnTargetDetached(TargetDetachedEventArgs e)
        {
            if (this.TargetDetached != null)
            {
                this.TargetDetached(this, e);
            }
        }
    }
}
