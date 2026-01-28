// <copyright file="LoadableComponentTests.cs" company="Selenium Committers">
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

namespace OpenQA.Selenium.Support.UI;

[TestFixture]
public class LoadableComponentTests
{
    [Test]
    public void ShouldDoNothingIfComponentIsAlreadyLoaded()
    {
        try
        {
            new DetonatingComponent().Load();
        }
        catch (NotImplementedException)
        {
            Assert.Fail("Should not have called the load method");
        }
    }

    [Test]
    public void ShouldCauseTheLoadMethodToBeCalledIfTheComponentIsNotAlreadyLoaded()
    {
        LoadsOk ok = new LoadsOk(true);

        ok.Load();

        Assert.That(ok.WasLoadCalled(), Is.True);
    }

    [Test]
    public void ShouldThrowAnErrorIfCallingLoadDoesNotCauseTheComponentToLoad()
    {
        LoadsOk ok = new LoadsOk(false);

        Assert.That(
            () => ok.Load(),
            Throws.InstanceOf<LoadableComponentException>().With.Message.EqualTo("Expected failure"));
    }

    [Test]
    public void ShouldCallHandleLoadErrorWhenWebDriverExceptionOccursDuringExecuteLoad()
    {
        ExecuteLoadThrows loadThrows = new ExecuteLoadThrows();

        Assert.That(
            () => loadThrows.Load(),
            Throws.Exception
            .With.Message.EqualTo("HandleLoadError called")
            .And.InnerException.Message.EqualTo("Excpected failure in ExecuteLoad"));

    }

    private class DetonatingComponent : LoadableComponent<DetonatingComponent>
    {

        protected override void ExecuteLoad()
        {
            throw new NotImplementedException("I should never be called");
        }

        protected override bool EvaluateLoadedStatus()
        {
            return true;
        }
    }

    private class LoadsOk : LoadableComponent<LoadsOk>
    {
        private readonly bool secondLoadCallPasses;
        private bool callOfLoadMethodForced;
        private bool loadCalled;

        public LoadsOk(bool secondLoadCallPasses)
        {
            this.secondLoadCallPasses = secondLoadCallPasses;
        }

        protected override void ExecuteLoad()
        {
            loadCalled = true;
        }

        protected override bool EvaluateLoadedStatus()
        {
            if (!callOfLoadMethodForced)
            {
                callOfLoadMethodForced = true;
                UnableToLoadMessage = "Should never be seen, ExecuteLoad() will be called and this will return true the second time unless testing for expected failure on the second pass.";
                return false;
            }

            if (!secondLoadCallPasses)
            {
                UnableToLoadMessage = "Expected failure";
                return false;
            }
            return true;
        }

        public bool WasLoadCalled()
        {
            return loadCalled;
        }
    }

    private class ExecuteLoadThrows : LoadableComponent<ExecuteLoadThrows>
    {
        protected override void ExecuteLoad()
        {
            throw new WebDriverException("Excpected failure in ExecuteLoad");
        }

        protected override bool EvaluateLoadedStatus()
        {
            return false;
        }

        protected override void HandleLoadError(WebDriverException ex)
        {
            throw new Exception("HandleLoadError called", ex);
        }
    }
}
