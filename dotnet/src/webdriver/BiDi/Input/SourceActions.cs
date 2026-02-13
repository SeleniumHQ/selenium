// <copyright file="SourceActions.cs" company="Selenium Committers">
// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
// </copyright>

using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using OpenQA.Selenium.BiDi.Json.Converters;
using OpenQA.Selenium.BiDi.Json.Converters.Enumerable;

namespace OpenQA.Selenium.BiDi.Input;

[JsonConverter(typeof(InputSourceActionsConverter))]
public abstract record SourceActions(string Id);

public interface ISourceAction;

public abstract record SourceActions<T>(string Id) : SourceActions(Id), IEnumerable<ISourceAction> where T : ISourceAction
{
    public IList<ISourceAction> Actions { get; init; } = [];

    public IEnumerator<ISourceAction> GetEnumerator() => Actions.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();

    public void Add(ISourceAction action) => Actions.Add(action);
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
[JsonDerivedType(typeof(KeyDownAction), "keyDown")]
[JsonDerivedType(typeof(KeyUpAction), "keyUp")]
public interface IKeySourceAction : ISourceAction;

public sealed record KeyActions(string Id) : SourceActions<IKeySourceAction>(Id)
{
    public KeyActions Type(string text)
    {
        foreach (var character in text)
        {
            Add(new KeyDownAction(character));
            Add(new KeyUpAction(character));
        }

        return this;
    }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
[JsonDerivedType(typeof(PointerDownAction), "pointerDown")]
[JsonDerivedType(typeof(PointerUpAction), "pointerUp")]
[JsonDerivedType(typeof(PointerMoveAction), "pointerMove")]
public interface IPointerSourceAction : ISourceAction;

public sealed record PointerActions(string Id) : SourceActions<IPointerSourceAction>(Id)
{
    public PointerParameters? Options { get; init; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
[JsonDerivedType(typeof(WheelScrollAction), "scroll")]
public interface IWheelSourceAction : ISourceAction;

public sealed record WheelActions(string Id) : SourceActions<IWheelSourceAction>(Id);

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(PauseAction), "pause")]
public interface INoneSourceAction : ISourceAction;

public sealed record NoneActions(string Id) : SourceActions<INoneSourceAction>(Id);

public abstract record KeySourceAction : IKeySourceAction;

public sealed record KeyDownAction(char Value) : KeySourceAction;

public sealed record KeyUpAction(char Value) : KeySourceAction;

public abstract record PointerSourceAction : IPointerSourceAction;

public sealed record PointerDownAction(int Button) : PointerSourceAction, IPointerCommonProperties
{
    public int? Width { get; init; }
    public int? Height { get; init; }
    public double? Pressure { get; init; }
    public double? TangentialPressure { get; init; }
    public int? Twist { get; init; }
    public double? AltitudeAngle { get; init; }
    public double? AzimuthAngle { get; init; }
}

public sealed record PointerUpAction(int Button) : PointerSourceAction;

public sealed record PointerMoveAction(double X, double Y) : PointerSourceAction, IPointerCommonProperties
{
    public int? Duration { get; init; }

    public Origin? Origin { get; init; }

    public int? Width { get; init; }
    public int? Height { get; init; }
    public double? Pressure { get; init; }
    public double? TangentialPressure { get; init; }
    public int? Twist { get; init; }
    public double? AltitudeAngle { get; init; }
    public double? AzimuthAngle { get; init; }
}

public abstract record WheelSourceAction : IWheelSourceAction;

public sealed record WheelScrollAction(int X, int Y, int DeltaX, int DeltaY) : WheelSourceAction
{
    public int? Duration { get; init; }

    public Origin? Origin { get; init; }
}

public abstract record NoneSourceAction : INoneSourceAction;

public sealed record PauseAction : ISourceAction, IKeySourceAction, IPointerSourceAction, IWheelSourceAction, INoneSourceAction
{
    public long? Duration { get; init; }
}

public sealed record PointerParameters
{
    public PointerType? PointerType { get; init; }
}

[JsonConverter(typeof(CamelCaseEnumConverter<PointerType>))]
public enum PointerType
{
    Mouse,
    Pen,
    Touch
}

public interface IPointerCommonProperties
{
    public int? Width { get; init; }

    public int? Height { get; init; }

    public double? Pressure { get; init; }

    public double? TangentialPressure { get; init; }

    public int? Twist { get; init; }

    public double? AltitudeAngle { get; init; }

    public double? AzimuthAngle { get; init; }
}
