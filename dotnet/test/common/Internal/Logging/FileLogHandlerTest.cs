// <copyright file="FileLogHandlerTest.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using NUnit.Framework;
using System;
using System.IO;
using System.Text.RegularExpressions;

namespace OpenQA.Selenium.Internal.Logging;

public class FileLogHandlerTest
{
    [TestCase(null)]
    [TestCase("")]
    public void ShouldNotAcceptIncorrectPath(string path)
    {
        var act = () => new FileLogHandler(path);

        Assert.That(act, Throws.ArgumentException);
    }

    [Test]
    public void ShouldHandleLogEvent()
    {
        var tempFile = Path.GetTempFileName();

        try
        {
            using (var fileLogHandler = new FileLogHandler(tempFile))
            {
                fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
            }

            Assert.That(File.ReadAllText(tempFile), Does.Contain("test message"));
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Test]
    public void ShouldCreateFileIfDoesNotExist()
    {
        var tempFile = Path.GetTempFileName();

        try
        {
            using (var fileLogHandler = new FileLogHandler(tempFile))
            {
                fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
            }

            using (var fileLogHandler2 = new FileLogHandler(tempFile))
            {
                fileLogHandler2.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
            }

            Assert.That(Regex.Matches(File.ReadAllText(tempFile), "test message"), Has.Count.EqualTo(1));
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Test]
    public void ShouldAppendFileIfExists()
    {
        var tempFilePath = Path.GetTempPath() + "somefile.log";

        try
        {
            using (var fileLogHandler = new FileLogHandler(tempFilePath))
            {
                fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
            }

            using (var fileLogHandler2 = new FileLogHandler(tempFilePath, overwrite: false))
            {
                fileLogHandler2.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
            }

            Assert.That(Regex.Matches(File.ReadAllText(tempFilePath), "test message"), Has.Count.EqualTo(2));
        }
        finally
        {
            File.Delete(tempFilePath);
        }
    }

    [Test]
    public void ShouldOverwriteFileIfExists()
    {
        var tempFile = Path.GetTempFileName();

        try
        {
            using (var fileLogHandler = new FileLogHandler(tempFile, overwrite: true))
            {
                fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
            }

            Assert.That(Regex.Matches(File.ReadAllText(tempFile), "test message"), Has.Count.EqualTo(1));
        }
        finally
        {
            File.Delete(tempFile);
        }
    }

    [Test]
    public void ShouldAppendFileIfDoesNotExist()
    {
        var tempFilePath = Path.GetTempPath() + "somefile.log";

        try
        {
            using (var fileLogHandler = new FileLogHandler(tempFilePath, overwrite: true))
            {
                fileLogHandler.Handle(new LogEvent(typeof(FileLogHandlerTest), DateTimeOffset.Now, LogEventLevel.Info, "test message"));
            }

            Assert.That(Regex.Matches(File.ReadAllText(tempFilePath), "test message"), Has.Count.EqualTo(1));
        }
        finally
        {
            File.Delete(tempFilePath);
        }
    }
}
