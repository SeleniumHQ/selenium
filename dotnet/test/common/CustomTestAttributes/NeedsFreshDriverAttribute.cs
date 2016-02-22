using NUnit.Framework;
using NUnit.Framework.Interfaces;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    public class NeedsFreshDriverAttribute : TestActionAttribute
    {
        private bool isCreatedBeforeTest = false;
        private bool isCreatedAfterTest = false;

        public bool IsCreatedBeforeTest
        {
            get { return isCreatedBeforeTest; }
            set { isCreatedBeforeTest = value; }
        }

        public bool IsCreatedAfterTest
        {
            get { return isCreatedAfterTest; }
            set { isCreatedAfterTest = value; }
        }

        public override void BeforeTest(ITest test)
        {
            DriverTestFixture fixtureInstance = test.Fixture as DriverTestFixture;
            if (fixtureInstance != null && this.isCreatedBeforeTest)
            {
                EnvironmentManager.Instance.CreateFreshDriver();
                fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
            }
            base.BeforeTest(test);
        }

        public override void AfterTest(ITest test)
        {
            DriverTestFixture fixtureInstance = test.Fixture as DriverTestFixture;
            if (fixtureInstance != null && this.isCreatedAfterTest)
            {
                EnvironmentManager.Instance.CreateFreshDriver();
                fixtureInstance.DriverInstance = EnvironmentManager.Instance.GetCurrentDriver();
            }
        }
    }
}
