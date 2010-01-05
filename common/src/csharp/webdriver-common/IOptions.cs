using System;
using System.Collections.Generic;
using System.Text;

namespace OpenQA.Selenium
{
    public interface IOptions
    {
        Speed Speed { get; set; }
        void AddCookie(Cookie cookie);
        List<Cookie> GetCookies();
        Cookie GetCookieNamed(string name);
        void DeleteCookie(Cookie cookie);
        void DeleteCookieNamed(String name);
        void DeleteAllCookies();
    }
}
