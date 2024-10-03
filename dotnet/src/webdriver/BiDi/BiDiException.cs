using System;

namespace OpenQA.Selenium.BiDi;

public class BiDiException : Exception
{
    public BiDiException(string message) : base(message)
    {
    }
}
