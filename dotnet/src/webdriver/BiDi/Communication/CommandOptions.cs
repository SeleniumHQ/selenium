using System;

namespace OpenQA.Selenium.BiDi.Communication;

public record CommandOptions
{
    public TimeSpan? Timeout { get; set; }
}
