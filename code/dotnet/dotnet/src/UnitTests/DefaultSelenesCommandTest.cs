using System;
using NUnit.Framework;
using Selenium;

namespace ThoughtWorks.Selenium.UnitTests
{
	/// <summary>
	/// Summary description for DefaultSelenesCommandTest.
	/// </summary>
	[TestFixture]
	public class DefaultSelenesCommandTest
	{
		[Test]
		public void ShouldCreateDefaultSeleneseCommand()
		{
			string commandString = "open";
			string argument1 = "http://localhost";
			string argument2 = "";
			DefaultSeleneseCommand command = new DefaultSeleneseCommand(commandString, argument1, argument2);
			Assert.AreEqual("|" + commandString + "|" + argument1 + "|" + argument2 + "|", command.CommandString);
		}

		[Test]
		public void ShouldParseCommandWithFourPipes()
		{
			string openCommand = "|setTextField|fieldName|fieldValue|";
			DefaultSeleneseCommand command = DefaultSeleneseCommand.Parse(openCommand);
			Assert.AreEqual("setTextField", command.Command);
			Assert.AreEqual("fieldName", command.Argument1);
			Assert.AreEqual("fieldValue", command.Argument2);
		}

		[Test]
		[ExpectedException(typeof(ArgumentException))]
		public void ShouldFailToParseCommandStringWithNoPipes()
		{
			DefaultSeleneseCommand.Parse("junk");
		}

		[Test]
		[ExpectedException(typeof(ArgumentException))]
		public void ShouldFailToParseCommandStringWithExtraPipes()
		{
			DefaultSeleneseCommand.Parse("|command|blah|blah|blah|");
		}

		[Test]
		[ExpectedException(typeof(ArgumentException))]
		public void ShouldFailToParseCommandStringWhichDoesNotStartWithAPipe()
		{
			DefaultSeleneseCommand.Parse("command|blah|blah|blah|");
		}

		[Test]
		[ExpectedException(typeof(ArgumentException))]
		public void ShouldFailToParseNullCommandString()
		{
			DefaultSeleneseCommand.Parse(null);
		}

		[Test]
		[ExpectedException(typeof(ArgumentException))]
		public void ShouldFailToParseCommandStringWithWhiteSpace()
		{
			DefaultSeleneseCommand.Parse("  ");
		}

	}
}