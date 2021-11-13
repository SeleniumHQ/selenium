// <copyright file="CommandInfo.cs" company="WebDriver Committers">
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
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Represents the information about a command.
    /// </summary>
    public abstract class CommandInfo : IEquatable<CommandInfo>
    {
        /// <summary>
        /// Gets the unique identifier for this command within the scope of its protocol definition
        /// </summary>
        public abstract string CommandIdentifier { get; }

        /// <summary>
        /// Returns the hash code for this <see cref="CommandInfo"/> object.
        /// </summary>
        /// <returns>A 32-bit signed integer hash code.</returns>
        public override int GetHashCode()
        {
            return this.CommandIdentifier.GetHashCode();
        }

        /// <summary>
        /// Determines whether this instance and a specified object, which must also be a <see cref="CommandInfo"/> object, have the same value.
        /// </summary>
        /// <param name="obj">The <see cref="CommandInfo"/> to compare to this instance.</param>
        /// <returns><see langword="true"/> if <paramref name="obj"/> is a <see cref="CommandInfo"/> and its value is the same as this instance; otherwise, <see langword="false"/>. If <paramref name="obj"/> is <see langword="null"/>, the method returns <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            return this.Equals(obj as CommandInfo);
        }

        /// <summary>
        /// Determines whether this instance and another specified <see cref="CommandInfo"/> object have the same value.
        /// </summary>
        /// <param name="other">The <see cref="CommandInfo"/> to compare to this instance.</param>
        /// <returns><see langword="true"/> if the value of the <paramref name="other"/> parameter is the same as this instance; otherwise, <see langword="false"/>. If <paramref name="other"/> is <see langword="null"/>, the method returns <see langword="false"/>.</returns>
        public bool Equals(CommandInfo other)
        {
            if (other is null)
            {
                return false;
            }

            // Optimization for a common success case.
            if (Object.ReferenceEquals(this, other))
            {
                return true;
            }

            // If run-time types are not exactly the same, return false.
            if (this.GetType() != other.GetType())
            {
                return false;
            }

            // Return true if the fields match.
            // Note that the base class is not invoked because it is
            // System.Object, which defines Equals as reference equality.
            return this.CommandIdentifier == other.CommandIdentifier;
        }

        /// <summary>
        /// Determines whether two specified <see cref="CommandInfo"/> objects have the same value.
        /// </summary>
        /// <param name="left">The first <see cref="CommandInfo"/> object to compare.</param>
        /// <param name="right">The second <see cref="CommandInfo"/> object to compare.</param>
        /// <returns><see langword="true"/> if the value of <paramref name="left"/> is the same as the value of <paramref name="right"/>; otherwise, <see langword="false"/>.</returns>
        public static bool operator ==(CommandInfo left, CommandInfo right)
        {
            if (left is null)
            {
                if (right is null)
                {
                    return true;
                }

                return false;
            }

            return left.Equals(right);
        }

        /// <summary>
        /// Determines whether two specified <see cref="CommandInfo"/> objects have different values.
        /// </summary>
        /// <param name="left">The first <see cref="CommandInfo"/> object to compare.</param>
        /// <param name="right">The second <see cref="CommandInfo"/> object to compare.</param>
        /// <returns><see langword="true"/> if the value of <paramref name="left"/> is different from the value of <paramref name="right"/>; otherwise, <see langword="false"/>.</returns>
        public static bool operator !=(CommandInfo left, CommandInfo right)
        {
            return !(left == right);
        }
    }
}
