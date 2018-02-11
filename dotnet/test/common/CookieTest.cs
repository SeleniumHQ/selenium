using System;
using NUnit.Framework;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CookieTest
    {
        [Test]
        public void CanCreateAWellFormedCookie()
        {
            new ReturnedCookie("Fish", "cod", "", "", DateTime.Now, false, false);
        }

        [Test]
        public void ShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute()
        {
            Assert.Throws<ArgumentException>(() => new ReturnedCookie("hi;hi", "value", null, null, DateTime.Now, false, false));
        }

        [Test]
        public void ShouldThrowAnExceptionWhenTheNameIsNull()
        {
            Assert.Throws<ArgumentException>(() => new ReturnedCookie(null, "value", null, null, DateTime.Now, false, false));
        }

        [Test]
        public void ShouldThrowAnExceptionWhenTheValueIsNull()
        {
            Assert.Throws<ArgumentNullException>(() => new ReturnedCookie("name", null, null, null, DateTime.Now, false, false));
        }

        [Test]
        public void CookiesShouldAllowSecureToBeSet()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, true, false);
            Assert.IsTrue(cookie.Secure);
        }

        [Test]
        public void CookiesShouldAllowHttpOnlyToBeSet()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, false, true);
            Assert.IsTrue(cookie.IsHttpOnly);
        }

        [Test]
        public void ShouldAllowExpiryToBeNull()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", null, false, false);
        }
    }
}
