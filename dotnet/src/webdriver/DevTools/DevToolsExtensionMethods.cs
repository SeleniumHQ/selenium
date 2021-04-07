using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.DevTools
{
    /// <summary>
    /// Provides extension methods for translation to and from the Chrome DevTools Protocol data structures.
    /// </summary>
    public static class DevToolsExtensionMethods
    {
        ///// <summary>
        ///// Translates a <see cref="Cookie"/> to the format to use with the Chrome DevTools Protocol cookie
        ///// manipulation methods.
        ///// </summary>
        ///// <param name="cookie">The <see cref="Cookie"/> to translate.</param>
        ///// <returns>A command settings object suitable for use with the Chromium DevTools Protocol manipulation methods.</returns>
        //public static Network.SetCookieCommandSettings ToDevToolsSetCookieCommandSettings(this Cookie cookie)
        //{
        //    Network.SetCookieCommandSettings commandSettings = new Network.SetCookieCommandSettings();
        //    commandSettings.Name = cookie.Name;
        //    commandSettings.Value = cookie.Value;
        //    commandSettings.Domain = cookie.Domain;
        //    commandSettings.Path = cookie.Path;
        //    commandSettings.HttpOnly = cookie.IsHttpOnly;
        //    commandSettings.Secure = cookie.Secure;
        //    commandSettings.Expires = cookie.ExpirySeconds;
        //    return commandSettings;
        //}

        ///// <summary>
        ///// Converts an array of Chrome DevTools Protocol cookie objects to a list of Selenium <see cref="Cookie"/> objects.
        ///// </summary>
        ///// <param name="cookies">The array of Chrome DevTools Protocol cookies to convert.</param>
        ///// <returns>A ReadOnlyCollection of <see cref="Cookie"/> objects.</returns>
        //public static ReadOnlyCollection<Cookie> ToSeleniumCookies(this Network.Cookie[] cookies)
        //{
        //    List<Cookie> seleniumCookies = new List<Cookie>();
        //    foreach(var cookie in cookies)
        //    {
        //        seleniumCookies.Add(cookie.ToSeleniumCookie());
        //    }

        //    return seleniumCookies.AsReadOnly();
        //}

        ///// <summary>
        ///// Converts a Chrome DevTools Protocol cookie object to a Selenium <see cref="Cookie"/> objects.
        ///// </summary>
        ///// <param name="cookies">The Chrome DevTools Protocol cookie to convert.</param>
        ///// <returns>A Selenium <see cref="Cookie"/> object.</returns>
        //public static Cookie ToSeleniumCookie(this Network.Cookie cookie)
        //{
        //    Dictionary<string, object> cookieValues = new Dictionary<string, object>();
        //    cookieValues["name"] = cookie.Name;
        //    cookieValues["value"] = cookie.Value;
        //    cookieValues["domain"] = cookie.Domain;
        //    cookieValues["path"] = cookie.Path;
        //    cookieValues["httpOnly"] = cookie.HttpOnly;
        //    cookieValues["secure"] = cookie.Secure;
        //    DateTime ? expires = null;
        //    if (!cookie.Secure)
        //    {
        //        cookieValues["expiry"] = cookie.Expires;
        //    }

        //    Cookie seleniumCookie = Cookie.FromDictionary(cookieValues);
        //    return seleniumCookie;
        //}
    }
}
