// <copyright file="FindsByAttribute.cs" company="WebDriver Committers">
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
using System.ComponentModel;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Base class for attributes to mark elements with methods by which to find a corresponding element on the page.
    /// In order to define custom FindsBy attribute, inherit from this class and implement Finder property.
    /// </summary>
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public abstract class AbstractFindsByAttribute : Attribute, IComparable
    {
        /// <summary>
        /// Gets an explicit <see cref="By"/> object to find by.
        /// </summary>
        public abstract By Finder { get; }

        /// <summary>
        /// Gets or sets a value indicating where this attribute should be evaluated relative to other instances
        /// of this attribute decorating the same class member.
        /// </summary>
        [DefaultValue(0)]
        public int Priority { get; set; }

        /// <summary>
        /// Determines if two <see cref="AbstractFindsByAttribute"/> instances are equal.
        /// </summary>
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the two instances are equal; otherwise, <see langword="false"/>.</returns>
        public static bool operator ==(AbstractFindsByAttribute one, AbstractFindsByAttribute two)
        {
            // If both are null, or both are same instance, return true.
            if (object.ReferenceEquals(one, two))
            {
                return true;
            }

            // If one is null, but not both, return false.
            if (((object)one == null) || ((object)two == null))
            {
                return false;
            }

            return one.Equals(two);
        }

        /// <summary>
        /// Determines if two <see cref="AbstractFindsByAttribute"/> instances are unequal.
        /// </summary>s
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the two instances are not equal; otherwise, <see langword="false"/>.</returns>
        public static bool operator !=(AbstractFindsByAttribute one, AbstractFindsByAttribute two)
        {
            return !(one == two);
        }

        /// <summary>
        /// Determines if one <see cref="AbstractFindsByAttribute"/> instance is greater than another.
        /// </summary>
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the first instance is greater than the second; otherwise, <see langword="false"/>.</returns>
        public static bool operator >(AbstractFindsByAttribute one, AbstractFindsByAttribute two)
        {
            if (one == null)
            {
                throw new ArgumentNullException("one", "Object to compare cannot be null");
            }

            return one.CompareTo(two) > 0;
        }

        /// <summary>
        /// Determines if one <see cref="AbstractFindsByAttribute"/> instance is less than another.
        /// </summary>
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the first instance is less than the second; otherwise, <see langword="false"/>.</returns>
        public static bool operator <(AbstractFindsByAttribute one, AbstractFindsByAttribute two)
        {
            if (one == null)
            {
                throw new ArgumentNullException("one", "Object to compare cannot be null");
            }

            return one.CompareTo(two) < 0;
        }

        /// <summary>
        /// Compares the current instance with another object of the same type and returns an
        /// integer that indicates whether the current instance precedes, follows, or occurs
        /// in the same position in the sort order as the other object.
        /// </summary>
        /// <param name="obj">An object to compare with this instance.</param>
        /// <returns>A value that indicates the relative order of the objects being compared. The return value has these meanings:
        /// <list type="table">
        /// <listheader>Value</listheader><listheader>Meaning</listheader>
        /// <item><description>Less than zero</description><description>This instance precedes <paramref name="obj"/> in the sort order.</description></item>
        /// <item><description>Zero</description><description>This instance occurs in the same position in the sort order as <paramref name="obj"/>.</description></item>
        /// <item><description>Greater than zero</description><description>This instance follows <paramref name="obj"/> in the sort order. </description></item>
        /// </list>
        /// </returns>
        public int CompareTo(object obj)
        {
            if (obj == null)
            {
                throw new ArgumentNullException("obj", "Object to compare cannot be null");
            }

            AbstractFindsByAttribute other = obj as AbstractFindsByAttribute;
            if (other == null)
            {
                throw new ArgumentException("Object to compare must be a AbstractFindsByAttribute", "obj");
            }

            // TODO(JimEvans): Construct an algorithm to sort on more than just Priority.
            if (this.Priority != other.Priority)
            {
                return this.Priority - other.Priority;
            }

            return 0;
        }

        /// <summary>
        /// Determines whether the specified <see cref="object">Object</see> is equal
        /// to the current <see cref="object">Object</see>.
        /// </summary>
        /// <param name="obj">The <see cref="object">Object</see> to compare with the
        /// current <see cref="object">Object</see>.</param>
        /// <returns><see langword="true"/> if the specified <see cref="object">Object</see>
        /// is equal to the current <see cref="object">Object</see>; otherwise,
        /// <see langword="false"/>.</returns>
        public override bool Equals(object obj)
        {
            if (obj == null)
            {
                return false;
            }

            AbstractFindsByAttribute other = obj as AbstractFindsByAttribute;
            if (other == null)
            {
                return false;
            }

            if (other.Priority != this.Priority)
            {
                return false;
            }

            if (other.Finder != this.Finder)
            {
                return false;
            }

            return true;
        }

        /// <summary>
        /// Serves as a hash function for a particular type.
        /// </summary>
        /// <returns>A hash code for the current <see cref="object">Object</see>.</returns>
        public override int GetHashCode()
        {
            return this.Finder.GetHashCode();
        }
    }
}
