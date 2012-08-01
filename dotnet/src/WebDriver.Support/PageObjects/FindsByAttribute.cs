// <copyright file="FindsByAttribute.cs" company="WebDriver Committers">
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
using System.ComponentModel;

namespace OpenQA.Selenium.Support.PageObjects
{
    /// <summary>
    /// Marks the program element with methods by which to find a corresponding element on the page. This 
    /// </summary>
    [AttributeUsage(AttributeTargets.Field | AttributeTargets.Property, AllowMultiple = true)]
    public sealed class FindsByAttribute : Attribute, IComparable
    {
        private By finder = null;

        /// <summary>
        /// Gets or sets the method used to look up the element
        /// </summary>
        [DefaultValue(How.Id)]
        public How How { get; set; }

        /// <summary>
        /// Gets or sets the value to lookup by (i.e. for How.Name, the actual name to look up)
        /// </summary>
        public string Using { get; set; }

        /// <summary>
        /// Gets or sets a value indicating where this attribute should be evaluated relative to other instances
        /// of this attribute decorating the same class member.
        /// </summary>
        [DefaultValue(0)]
        public int Priority { get; set; }

        /// <summary>
        /// Gets or sets an explicit <see cref="By"/> object to find by.
        /// Setting this property takes precedence over setting the How or Using properties.
        /// </summary>
        internal By Finder
        {
            get
            {
                if (this.finder == null)
                {
                    this.finder = ByFactory.From(this);
                }

                return this.finder;
            }

            set
            {
                this.finder = (By)value;
            }
        }

        /// <summary>
        /// Determines if two <see cref="FindsByAttribute"/> instances are equal.
        /// </summary>
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the two instances are equal; otherwise, <see langword="false"/>.</returns>
        public static bool operator ==(FindsByAttribute one, FindsByAttribute two)
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
        /// Determines if two <see cref="FindsByAttribute"/> instances are unequal.
        /// </summary>s
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the two instances are not equal; otherwise, <see langword="false"/>.</returns>
        public static bool operator !=(FindsByAttribute one, FindsByAttribute two)
        {
            return !(one == two);
        }

        /// <summary>
        /// Determines if one <see cref="FindsByAttribute"/> instance is greater than another.
        /// </summary>
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the first instance is greater than the second; otherwise, <see langword="false"/>.</returns>
        public static bool operator >(FindsByAttribute one, FindsByAttribute two)
        {
            return one.CompareTo(two) > 0;
        }

        /// <summary>
        /// Determines if one <see cref="FindsByAttribute"/> instance is less than another.
        /// </summary>
        /// <param name="one">One instance to compare.</param>
        /// <param name="two">The other instance to compare.</param>
        /// <returns><see langword="true"/> if the first instance is less than the second; otherwise, <see langword="false"/>.</returns>
        public static bool operator <(FindsByAttribute one, FindsByAttribute two)
        {
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
        /// <item><description>Less than zero</description><description>This instance precedes obj in the sort order.</description></item>
        /// <item><description>Zero</description><description>This instance occurs in the same position in the sort order as obj.</description></item>
        /// <item><description>Greater than zero</description><description>This instance follows obj in the sort order. </description></item>
        /// </list>
        /// </returns>
        public int CompareTo(object obj)
        {
            if (obj == null)
            {
                throw new ArgumentNullException("obj", "Object to compare cannot be null");
            }

            FindsByAttribute other = obj as FindsByAttribute;
            if (other == null)
            {
                throw new ArgumentException("Object to compare must be a FindsByAttribute", "obj");
            }

            // TODO(JimEvans): Construct an algorithm to sort on more than just Priority.
            if (this.Priority != other.Priority)
            {
                return this.Priority - other.Priority;
            }

            return 0;
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
            if (obj == null)
            {
                return false;
            }

            FindsByAttribute other = obj as FindsByAttribute;
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
        /// <returns>A hash code for the current <see cref="System.Object">Object</see>.</returns>
        public override int GetHashCode()
        {
            return this.Finder.GetHashCode();
        }
    }
}