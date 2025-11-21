using System;

namespace OpenQA.Selenium.BiDi;

public readonly record struct Optional<T>
{
    private readonly T _value;
    public bool IsSet { get; }

    public T Value => IsSet
        ? _value
        : throw new InvalidOperationException("Optional has no value. Check IsSet first.");

    public Optional(T value)
    {
        _value = value;
        IsSet = true;
    }

    public bool TryGetValue(out T value)
    {
        value = _value;
        return IsSet;
    }

    public override string ToString() => IsSet ? $"Some({_value})" : "Unset";

    // implicit conversion from T -> Optional<T>
    public static implicit operator Optional<T>(T value) => new(value);
}
