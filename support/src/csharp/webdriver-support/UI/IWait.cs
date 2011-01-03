using System;

namespace OpenQA.Selenium.Support.UI
{
    public interface IWait<TSource>
    {
        TResult Until<TResult>(Func<TSource, TResult> condition);
    }
}