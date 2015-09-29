using System;
using System.Collections.Generic;
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
        [ExpectedException(typeof(ArgumentException))]
        public void ShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute()
        {
            new ReturnedCookie("hi;hi", "value", null, null, DateTime.Now, false, false);
        }

        [Test]
        [ExpectedException(typeof(ArgumentException))]
        public void ShouldThrowAnExceptionWhenTheNameIsNull()
        {
            new ReturnedCookie(null, "value", null, null, DateTime.Now, false, false);
        }

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ShouldThrowAnExceptionWhenTheValueIsNull()
        {
            new ReturnedCookie("name", null, null, null, DateTime.Now, false, false);
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
