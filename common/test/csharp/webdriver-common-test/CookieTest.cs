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
            new ReturnedCookie("Fish", "cod", "", "", DateTime.Now, false, new Uri("http://localhost"));
        }

        [Test]
        [ExpectedException(typeof(ArgumentException))]
        public void ShouldThrowAnExceptionWhenSemiColonExistsInTheCookieAttribute()
        {
            new ReturnedCookie("hi;hi", "value", null, null, DateTime.Now, false, new Uri("http://localhost"));
        }

        [Test]
        [ExpectedException(typeof(ArgumentException))]
        public void ShouldThrowAnExceptionWhenTheNameIsNull()
        {
            new ReturnedCookie(null, "value", null, null, DateTime.Now, false, new Uri("http://localhost"));
        }

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ShouldThrowAnExceptionWhenTheValueIsNull()
        {
            new ReturnedCookie("name", null, null, null, DateTime.Now, false, new Uri("http://localhost"));
        }

        [Test]
        public void CookiesShouldAllowSecureToBeSet()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", DateTime.Now, true, new Uri("http://localhost"));
            Assert.IsTrue(cookie.Secure);
        }

        [Test]
        public void ShouldAllowExpiryToBeNull()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", null, false, new Uri("http://localhost"));
        }

        [Test]
        [ExpectedException(typeof(ArgumentNullException))]
        public void ShouldThrowAnExceptionWhenUriOfReturnedCookieIsNull()
        {
            Cookie cookie = new ReturnedCookie("name", "value", "", "/", null, false, null);
        }
    }
}
