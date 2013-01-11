using System;
using NUnit.Framework;

namespace OpenQA.Selenium.Support.UI
{
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

            Assert.True(ok.WasLoadCalled());
        }

        [Test]
        public void ShouldThrowAnErrorIfCallingLoadDoesNotCauseTheComponentToLoad()
        {
            LoadsOk ok = new LoadsOk(false);

            try
            {
                ok.Load();
                Assert.Fail();
            }
            catch (LoadableComponentException e)
            {
                Assert.AreEqual("Expected failure", e.Message);
            }
        }

        [Test]
        public void ShouldCallHandleLoadErrorWhenWebDriverExceptionOccursDuringExecuteLoad()
        {
            ExecuteLoadThrows loadThrows = new ExecuteLoadThrows();
            try
            {
                loadThrows.Load();
                Assert.Fail();
            }
            catch (Exception e)
            {
                Assert.AreEqual("HandleLoadError called", e.Message);
                Assert.AreEqual("Excpected failure in ExecuteLoad", e.InnerException.Message);
            }

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
}
