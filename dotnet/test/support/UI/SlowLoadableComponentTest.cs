// <copyright file="SlowLoadableComponentTest.cs" company="Selenium Committers">
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
public class SlowLoadableComponentTest
{

    [Test]
    public void TestShouldDoNothingIfComponentIsAlreadyLoaded()
    {
        try
        {
            new DetonatingSlowLoader().Load();
        }
        catch (Exception)
        {
            Assert.Fail("Did not expect load to be called");
        }
    }

    [Test]
    public void TestShouldCauseTheLoadMethodToBeCalledIfTheComponentIsNotAlreadyLoaded()
    {
        int numberOfTimesThroughLoop = 1;
        SlowLoading slowLoading = new SlowLoading(TimeSpan.FromSeconds(1), SystemClock.Instance, numberOfTimesThroughLoop).Load();

        Assert.That(slowLoading.GetLoopCount(), Is.EqualTo(numberOfTimesThroughLoop));
    }

    [Test]
    public void TestTheLoadMethodShouldOnlyBeCalledOnceIfTheComponentTakesALongTimeToLoad()
    {
        try
        {
            new OnlyOneLoad(TimeSpan.FromSeconds(5), SystemClock.Instance, 5).Load();
        }
        catch (Exception)
        {
            Assert.Fail("Did not expect load to be called more than once");
        }
    }

    [Test]
    public void TestShouldThrowAnErrorIfCallingLoadDoesNotCauseTheComponentToLoadBeforeTimeout()
    {
        HandCrankClock clock = new HandCrankClock();

        Assert.That(
            () => new BasicSlowLoader(TimeSpan.FromSeconds(2), clock).Load(),
            Throws.InstanceOf<WebDriverTimeoutException>());
    }

    [Test]
    public void TestShouldCancelLoadingIfAnErrorIsDetected()
    {
        HasError error = new HasError();

        Assert.That(
           () => error.Load(),
           Throws.InstanceOf<CustomException>());
    }


    private class DetonatingSlowLoader : SlowLoadableComponent<DetonatingSlowLoader>
    {

        public DetonatingSlowLoader() : base(TimeSpan.FromSeconds(1), SystemClock.Instance) { }

        protected override void ExecuteLoad()
        {
            throw new Exception("Should never be called");
        }

        protected override bool EvaluateLoadedStatus()
        {
            return true;
        }
    }

    private class SlowLoading : SlowLoadableComponent<SlowLoading>
    {

        private readonly int counts;
        private long loopCount;

        public SlowLoading(TimeSpan timeOut, SystemClock clock, int counts)
            : base(timeOut, clock)
        {
            this.counts = counts;
        }

        protected override void ExecuteLoad()
        {
            // Does nothing
        }

        protected override bool EvaluateLoadedStatus()
        {
            if (loopCount > counts)
            {
                throw new Exception();
            }

            loopCount++;
            return true;
        }

        public long GetLoopCount()
        {
            return loopCount;
        }
    }

    private class OnlyOneLoad : SlowLoading
    {

        private bool loadAlreadyCalled;

        public OnlyOneLoad(TimeSpan timeout, SystemClock clock, int counts) : base(timeout, clock, counts) { }

        protected override void ExecuteLoad()
        {
            if (loadAlreadyCalled)
            {
                throw new Exception();
            }
            loadAlreadyCalled = true;
        }
    }

    private class BasicSlowLoader : SlowLoadableComponent<BasicSlowLoader>
    {

        private readonly HandCrankClock handCrankClock;
        public BasicSlowLoader(TimeSpan timeOut, HandCrankClock clock)
            : base(timeOut, clock)
        {
            this.handCrankClock = clock;
        }

        protected override void ExecuteLoad()
        {
            // Does nothing
        }

        protected override bool EvaluateLoadedStatus()
        {
            // Cheat and increment the clock here, because otherwise it's hard to
            // get to.
            handCrankClock.MoveTime(TimeSpan.FromSeconds(1));
            return false; // Never loads
        }
    }

    private class HasError : SlowLoadableComponent<HasError>
    {

        public HasError() : base(TimeSpan.FromSeconds(1000), new HandCrankClock()) { }

        protected override void ExecuteLoad()
        {
            // does nothing
        }

        protected override bool EvaluateLoadedStatus()
        {
            return false;       //never loads
        }

        protected override void HandleErrors()
        {
            throw new CustomException();
        }
    }

    private class CustomException : Exception;
}
