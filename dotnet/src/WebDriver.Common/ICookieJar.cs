using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Text;

namespace OpenQA.Selenium
{
    /// <summary>
    /// Defines an interface allowing the user to manipulate cookies on the current page.
    /// </summary>
    public interface ICookieJar
    {
        /// <summary>
        /// Gets all cookies defined for the current page.
        /// </summary>
        ReadOnlyCollection<Cookie> AllCookies { get; }

        /// <summary>
        /// Adds a cookie to the current page.
        /// </summary>
        /// <param name="cookie">The <see cref="Cookie"/> object to be added.</param>
        void AddCookie(Cookie cookie);

        /// <summary>
        /// Gets a cookie with the specified name.
        /// </summary>
        /// <param name="name">The name of the cookie to retrieve.</param>
        /// <returns>The <see cref="Cookie"/> containing the name. Returns <see langword="null"/>
        /// if no cookie with the specified name is found.</returns>
        Cookie GetCookieNamed(string name);

        /// <summary>
        /// Deletes the specified cookie from the page.
        /// </summary>
        /// <param name="cookie">The <see cref="Cookie"/> to be deleted.</param>
        void DeleteCookie(Cookie cookie);

        /// <summary>
        /// Deletes the cookie with the specified name from the page.
        /// </summary>
        /// <param name="name">The name of the cookie to be deleted.</param>
        void DeleteCookieNamed(string name);

        /// <summary>
        /// Deletes all cookies from the page.
        /// </summary>
        void DeleteAllCookies();
    }
}
