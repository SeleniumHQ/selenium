using System;

#nullable enable

namespace OpenQA.Selenium.BiDi;

public class BiDiException : Exception
{
    public BiDiException(string message) : base(message)
    {
    }
}
