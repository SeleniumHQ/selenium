using System;
using System.Threading.Tasks;

namespace OpenQA.Selenium.DevTools
{
    public interface ILog
    {
        Task Enable();

        Task Clear();

        event EventHandler<EntryAddedEventArgs> EntryAdded;
    }
}