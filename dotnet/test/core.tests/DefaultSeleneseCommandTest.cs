/*
 * Copyright 2011 Software Freedom Conservancy.
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
using NUnit.Framework;
using Selenium;

namespace ThoughtWorks.Selenium.UnitTests
{
    /// <summary>
    /// Summary description for DefaultSelenesCommandTest.
    /// </summary>
    [TestFixture]
	public class DefaultSeleneseCommandTest
	{
		[Test]
		public void ShouldCreateDefaultRemoteCommand()
		{
			string commandString = "open";
			string argument1 = "http://localhost";
			string argument2 = "";
			DefaultRemoteCommand command = new DefaultRemoteCommand(commandString, new string[]{argument1, argument2});
            Assert.That(command.CommandString, Is.EqualTo("cmd=open&1=http%3a%2f%2flocalhost&2=").IgnoreCase);
		}

		[Test]
		public void ShouldParseCommandWithFourPipes()
		{
			string openCommand = "|setTextField|fieldName|fieldValue|";
			DefaultRemoteCommand command = DefaultRemoteCommand.Parse(openCommand);
			Assert.AreEqual("setTextField", command.Command);
			Assert.AreEqual("fieldName", command.Args[0]);
			Assert.AreEqual("fieldValue", command.Args[1]);
		}

		[Test]
		public void ShouldFailToParseCommandStringWithNoPipes()
		{
            Assert.Throws<ArgumentException>(() => DefaultRemoteCommand.Parse("junk"));
		}

		[Test]
		public void ShouldFailToParseCommandStringWithExtraPipes()
		{
            Assert.Throws<ArgumentException>(() => DefaultRemoteCommand.Parse("|command|blah|blah|blah|"));
		}

		[Test]
		public void ShouldFailToParseCommandStringWhichDoesNotStartWithAPipe()
		{
            Assert.Throws<ArgumentException>(() => DefaultRemoteCommand.Parse("command|blah|blah|blah|"));
		}

		[Test]
		public void ShouldFailToParseNullCommandString()
		{
            Assert.Throws<ArgumentException>(() => DefaultRemoteCommand.Parse(null));
		}

		[Test]
		public void ShouldFailToParseCommandStringWithWhiteSpace()
		{
            Assert.Throws<ArgumentException>(() => DefaultRemoteCommand.Parse("  "));
		}

	}
}
