using System;
using System.Collections.Generic;
using NUnit.Framework;
using NUnit.Framework.SyntaxHelpers;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class CookieTest
    {
        [Test]
        public void CanCreateAWellFormedCookie()
        {
            new ReturnedCookie("Fish", "cod", "", "", DateTime.Now, false);
        }

        [Test]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowAnExceptionWhenTheDomainIsBad()
        {
            new ReturnedCookie("Fish", "cod", "127.0.0.-1", null, DateTime.Now, false);
        }

        [Test]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute()
        {
            new ReturnedCookie("hi;hi", "value", null, null, DateTime.Now, false);
        }

        [Test]
        [ExpectedException(typeof(InvalidOperationException))]
        public void ShouldThrowAnExceptionTheNameIsNull()
        {
            new ReturnedCookie(null, "value", null, null, DateTime.Now, false);

        }

        [Test]
        public void CookiesShouldAllowSecureToBeSet()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, true);
            Assert.IsTrue(cookie.Secure);
        }
    }
}
