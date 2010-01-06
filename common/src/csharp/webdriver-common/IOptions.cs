using System;
using System.Collections.Generic;
using System.Text;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    public interface IOptions
    {
        Speed Speed { get; set; }
        void AddCookie(Cookie cookie);
        ReadOnlyCollection<Cookie> GetCookies();
        Cookie GetCookieNamed(string name);
        void DeleteCookie(Cookie cookie);
        void DeleteCookieNamed(String name);
        void DeleteAllCookies();
    }
}
