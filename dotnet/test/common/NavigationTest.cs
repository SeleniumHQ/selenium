using NUnit.Framework;
using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium
{

    [TestFixture]
    public class NavigationTest : DriverTestFixture
    {

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public void ShouldNotHaveProblemNavigatingWithNoPagesBrowsed()
        {
            INavigation navigation;
            navigation = driver.Navigate();
            navigation.Back();
            navigation.Forward();
        }

        [Test]
        public void ShouldGoBackAndForward()
        {
            INavigation navigation;
            navigation = driver.Navigate();

            driver.Url = macbethPage;
            driver.Url = simpleTestPage;

            navigation.Back();
            Assert.AreEqual(macbethTitle, driver.Title);

            navigation.Forward();
            Assert.AreEqual(simpleTestTitle, driver.Title);
        }

        [Test]
        public void ShouldAcceptInvalidUrlsUsingUris()
        {
            INavigation navigation;
            navigation = driver.Navigate();
            Assert.That(() => navigation.GoToUrl((Uri)null), Throws.InstanceOf<ArgumentNullException>());
            // new Uri("") and new Uri("isidsji30342??éåµñ©æ")
            // throw an exception, so we needn't worry about them.
        }

        [Test]
        public void ShouldGoToUrlUsingString()
        {
            INavigation navigation;
            navigation = driver.Navigate();

            navigation.GoToUrl(macbethPage);
            Assert.AreEqual(macbethTitle, driver.Title);

            // We go to two pages to ensure that the browser wasn't
            // already at the desired page through a previous test.
            navigation.GoToUrl(simpleTestPage);
            Assert.AreEqual(simpleTestTitle, driver.Title);
        }

        [Test]
        public void ShouldGoToUrlUsingUri()
        {
            Uri macBeth = new Uri(macbethPage);
            Uri simpleTest = new Uri(simpleTestPage);
            INavigation navigation;
            navigation = driver.Navigate();

            navigation.GoToUrl(macBeth);
            Assert.AreEqual(driver.Title, macbethTitle);

            // We go to two pages to ensure that the browser wasn't
            // already at the desired page through a previous test.
            navigation.GoToUrl(simpleTest);
            Assert.AreEqual(simpleTestTitle, driver.Title);
        }

        [Test]
        public void ShouldRefreshPage()
        {
            driver.Url = javascriptPage;
            IWebElement changedDiv = driver.FindElement(By.Id("dynamo"));
            driver.FindElement(By.Id("updatediv")).Click();

            Assert.AreEqual("Fish and chips!", changedDiv.Text);
            driver.Navigate().Refresh();

            changedDiv = driver.FindElement(By.Id("dynamo"));
            Assert.AreEqual("What's for dinner?", changedDiv.Text);
        }

        [Test]
        [NeedsFreshDriver(IsCreatedBeforeTest = true)]
        public Task ShouldNotHaveProblemNavigatingWithNoPagesBrowsedAsync()
        {
            var navigation = driver.Navigate();
            Assert.DoesNotThrowAsync(async () => await navigation.BackAsync());
            Assert.DoesNotThrowAsync(async () => await navigation.ForwardAsync());
            return Task.CompletedTask;
        }

        [Test]
        public async Task ShouldGoBackAndForwardAsync()
        {
            INavigation navigation = driver.Navigate();

            await navigation.GoToUrlAsync(macbethPage);
            await navigation.GoToUrlAsync(simpleTestPage);

            await navigation.BackAsync();
            Assert.AreEqual(macbethTitle, driver.Title);

            await navigation.ForwardAsync();
            Assert.AreEqual(simpleTestTitle, driver.Title);
        }

        [Test]
        public void ShouldAcceptInvalidUrlsUsingUrisAsync()
        {
            INavigation navigation = driver.Navigate();
            Assert.That(async () => await navigation.GoToUrlAsync((Uri)null), Throws.InstanceOf<ArgumentNullException>());
        }

        [Test]
        public async Task ShouldGoToUrlUsingStringAsync()
        {
            var navigation = driver.Navigate();

            await navigation.GoToUrlAsync(macbethPage);
            Assert.AreEqual(macbethTitle, driver.Title);

            await navigation.GoToUrlAsync(simpleTestPage);
            Assert.AreEqual(simpleTestTitle, driver.Title);
        }

        [Test]
        public void ShouldGoToUrlUsingUriAsync()
        {
            var navigation = driver.Navigate();

            navigation.GoToUrlAsync(new Uri(macbethPage));
            Assert.AreEqual(driver.Title, macbethTitle);
            navigation.GoToUrl(new Uri(simpleTestPage));
            Assert.AreEqual(simpleTestTitle, driver.Title);
        }

        [Test]
        public async Task ShouldRefreshPageAsync()
        {
            await driver.Navigate().GoToUrlAsync(javascriptPage);
            IWebElement changedDiv = driver.FindElement(By.Id("dynamo"));
            driver.FindElement(By.Id("updatediv")).Click();

            Assert.AreEqual("Fish and chips!", changedDiv.Text);
            await driver.Navigate().RefreshAsync();

            changedDiv = driver.FindElement(By.Id("dynamo"));
            Assert.AreEqual("What's for dinner?", changedDiv.Text);
        }
    }
}
