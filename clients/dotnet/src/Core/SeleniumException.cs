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
	}
}
