/* Copyright notice and license
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the speed with which actions are executed in the browser.
    /// </summary>
    public class Speed
    {
        /// <summary>
        /// Gets a slow speed.
        /// </summary>
        public static readonly Speed Slow = new Speed("Slow", 1000);

        /// <summary>
        /// Gets a medium speed.
        /// </summary>
        public static readonly Speed Medium = new Speed("Medium", 500);

        /// <summary>
        /// Gets a fast speed.
        /// </summary>
        public static readonly Speed Fast = new Speed("Fast", 0);

        private int speedTimeout = 0;
        private string speedDescription = string.Empty;

        private Speed(string description, int timeout)
        {
            speedDescription = description;
            speedTimeout = timeout;
        }

        /// <summary>
        /// Gets the timeout for the speed.
        /// </summary>
        public int Timeout
        {
            get { return speedTimeout; }
        }

        /// <summary>
        /// Gets the description of the speed.
        /// </summary>
        public string Description
        {
            get { return speedDescription; }
        }

        /// <summary>
        /// Creates a <see cref="Speed"/> object from its string description.
        /// </summary>
        /// <param name="speedName">The description of the speed to create.</param>
        /// <returns>The <see cref="Speed"/> object.</returns>
        public static Speed FromString(string speedName)
        {
            Speed toReturn = Fast;
            if (string.Compare(speedName, "medium", StringComparison.OrdinalIgnoreCase) == 0)
            {
                toReturn = Medium;
            }

            if (string.Compare(speedName, "slow", StringComparison.OrdinalIgnoreCase) == 0)
            {
                toReturn = Slow;
            }

            return toReturn;
        }

        /// <summary>
        /// Serves as a hash function for a particular type.
        /// </summary>
        /// <returns>A hash code for the current <see cref="System.Object">Object</see>.</returns>
        public override int GetHashCode()
        {
            return speedDescription.GetHashCode();
        }

        /// <summary>
        /// Determines whether the specified <see cref="System.Object">Object</see> is equal 
        /// to the current <see cref="System.Object">Object</see>.
        /// </summary>
        /// <param name="obj">The <see cref="System.Object">Object</see> to compare with the 
        /// current <see cref="System.Object">Object</see>.</param>
        /// <returns><see langword="true"/> if the specified <see cref="System.Object">Object</see>
        /// is equal to the current <see cref="System.Object">Object</see>; otherwise,
        /// <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            bool isEqual = false;
            Speed otherObject = obj as Speed;
            if (otherObject != null)
            {
                isEqual = string.Compare(otherObject.Description, speedDescription, StringComparison.OrdinalIgnoreCase) == 0;
            }

            return base.Equals(obj);
        }
    }
}
