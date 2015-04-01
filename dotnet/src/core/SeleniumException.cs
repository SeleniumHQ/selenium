/*
 * Copyright 2015 Software Freedom Conservancy.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

using System;

namespace Selenium
{
	/// <summary>
	/// Thrown when a Selenium command fails.
	/// </summary>
	public class SeleniumException : Exception
	{
		/// <summary>
		/// Creates a simple exception
		/// </summary>
		public SeleniumException()
		{
			
		}

		/// <summary>
		/// Creates an exception with the specified message
		/// </summary>
		/// <param name="message">the message to add to the exception</param>
		public SeleniumException(string message) : base(message)
		{
		}

		/// <summary>
		/// Creates an exception with the specified message and inner exception
		/// </summary>
		/// <param name="message">the message to add to the exception</param>
        /// <param name="innerException">the inner exception wrapped by this exception</param>
        public SeleniumException(string message, Exception innerException) : base(message, innerException)
		{
		}
	}
}
