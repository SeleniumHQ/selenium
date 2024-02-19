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

using System;
using NUnit.Framework;

namespace OpenQA.Selenium.Support.UI
{
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
            SlowLoading slowLoading = new SlowLoading(TimeSpan.FromSeconds(1), new SystemClock(), numberOfTimesThroughLoop).Load();

            Assert.AreEqual(numberOfTimesThroughLoop, slowLoading.GetLoopCount());
        }

        [Test]
        public void TestTheLoadMethodShouldOnlyBeCalledOnceIfTheComponentTakesALongTimeToLoad()
        {
            try
            {
                new OnlyOneLoad(TimeSpan.FromSeconds(5), new SystemClock(), 5).Load();
            }
            catch (Exception)
            {
                Assert.Fail("Did not expect load to be called more than once");
            }
        }

        [Test]
        public void TestShouldThrowAnErrorIfCallingLoadDoesNotCauseTheComponentToLoadBeforeTimeout()
        {
            FakeClock clock = new FakeClock();
            try
            {
                new BasicSlowLoader(TimeSpan.FromSeconds(2), clock).Load();
                Assert.Fail();
            }
            catch (WebDriverTimeoutException)
            {
                // We expect to time out
            }
        }

        [Test]
        public void TestShouldCancelLoadingIfAnErrorIsDetected()
        {
            HasError error = new HasError();

            try
            {
                error.Load();
                Assert.Fail();
            }
            catch (CustomException)
            {
                // This is expected
            }
        }


        private class DetonatingSlowLoader : SlowLoadableComponent<DetonatingSlowLoader>
        {

            public DetonatingSlowLoader() : base(TimeSpan.FromSeconds(1), new SystemClock()) { }

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

            private readonly FakeClock clock;
            public BasicSlowLoader(TimeSpan timeOut, FakeClock clock)
                : base(timeOut, clock)
            {
                this.clock = clock;
            }

            protected override void ExecuteLoad()
            {
                // Does nothing
            }

            protected override bool EvaluateLoadedStatus()
            {
                // Cheat and increment the clock here, because otherwise it's hard to
                // get to.
                clock.TimePasses(TimeSpan.FromSeconds(1));
                return false; // Never loads
            }
        }

        private class HasError : SlowLoadableComponent<HasError>
        {

            public HasError() : base(TimeSpan.FromSeconds(1000), new FakeClock()) { }

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

        private class CustomException : Exception
        {

        }
    }

}
