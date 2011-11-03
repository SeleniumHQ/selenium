// <copyright file="CompositeAction.cs" company="WebDriver Committers">
// Copyright 2007-2011 WebDriver committers
// Copyright 2007-2011 Google Inc.
// Portions copyright 2011 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
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

namespace OpenQA.Selenium.Interactions
{
    /// <summary>
    /// Defines an action that consists of a list of other actions to be performed in the browser.
    /// </summary>
    internal class CompositeAction : IAction
    {
        private List<IAction> actionsList = new List<IAction>();

        /// <summary>
        /// Adds an action to the list of actions to be performed.
        /// </summary>
        /// <param name="action">An <see cref="IAction"/> to be appended to the
        /// list of actions to be performed.</param>
        /// <returns>A self reference.</returns>
        public CompositeAction AddAction(IAction action)
        {
            this.actionsList.Add(action);
            return this;
        }

        #region IAction Members
        /// <summary>
        /// Performs the actions defined in this list of actions.
        /// </summary>
        public void Perform()
        {
            foreach (IAction action in this.actionsList)
            {
                action.Perform();
            }
        }

        #endregion
    }
}
