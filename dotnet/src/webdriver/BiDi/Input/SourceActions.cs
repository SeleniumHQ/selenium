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

using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace OpenQA.Selenium.BiDi.Input;

public abstract record SourceActions
{
    public string Id { get; } = Guid.NewGuid().ToString();
}

public interface ISourceAction;

public abstract record SourceActions<T> : SourceActions, IEnumerable<ISourceAction> where T : ISourceAction
{
    public IList<ISourceAction> Actions { get; set; } = [];

    public IEnumerator<ISourceAction> GetEnumerator() => Actions.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => Actions.GetEnumerator();

    public void Add(ISourceAction action) => Actions.Add(action);
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
[JsonDerivedType(typeof(DownKey), "keyDown")]
[JsonDerivedType(typeof(UpKey), "keyUp")]
public interface IKeySourceAction : ISourceAction;

public sealed record KeyActions : SourceActions<IKeySourceAction>
{
    public KeyActions Type(string text)
    {
        foreach (var character in text)
        {
            Add(new DownKey(character));
            Add(new UpKey(character));
        }

        return this;
    }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
[JsonDerivedType(typeof(DownPointer), "pointerDown")]
[JsonDerivedType(typeof(UpPointer), "pointerUp")]
[JsonDerivedType(typeof(MovePointer), "pointerMove")]
public interface IPointerSourceAction : ISourceAction;

public sealed record PointerActions : SourceActions<IPointerSourceAction>
{
    public PointerParameters? Options { get; set; }
}

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
[JsonDerivedType(typeof(ScrollWheel), "scroll")]
public interface IWheelSourceAction : ISourceAction;

public sealed record WheelActions : SourceActions<IWheelSourceAction>;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(Pause), "pause")]
public interface INoneSourceAction : ISourceAction;

public sealed record NoneActions : SourceActions<None>;

public abstract record Key : IKeySourceAction;

public sealed record DownKey(char Value) : Key;

public sealed record UpKey(char Value) : Key;

public abstract record Pointer : IPointerSourceAction;

public sealed record DownPointer(int Button) : Pointer, IPointerCommonProperties
{
    public int? Width { get; set; }
    public int? Height { get; set; }
    public double? Pressure { get; set; }
    public double? TangentialPressure { get; set; }
    public int? Twist { get; set; }
    public double? AltitudeAngle { get; set; }
    public double? AzimuthAngle { get; set; }
}

public sealed record UpPointer(int Button) : Pointer;

public sealed record MovePointer(int X, int Y) : Pointer, IPointerCommonProperties
{
    public int? Duration { get; set; }

    public Origin? Origin { get; set; }

    public int? Width { get; set; }
    public int? Height { get; set; }
    public double? Pressure { get; set; }
    public double? TangentialPressure { get; set; }
    public int? Twist { get; set; }
    public double? AltitudeAngle { get; set; }
    public double? AzimuthAngle { get; set; }
}

public abstract record Wheel : IWheelSourceAction;

public sealed record ScrollWheel(int X, int Y, int DeltaX, int DeltaY) : Wheel
{
    public int? Duration { get; set; }

    public Origin? Origin { get; set; }
}

public abstract record None : INoneSourceAction;

public sealed record Pause : ISourceAction, IKeySourceAction, IPointerSourceAction, IWheelSourceAction, INoneSourceAction
{
    public long? Duration { get; set; }
}

public sealed record PointerParameters
{
    public PointerType? PointerType { get; set; }
}

public enum PointerType
{
    Mouse,
    Pen,
    Touch
}

public interface IPointerCommonProperties
{
    public int? Width { get; set; }

    public int? Height { get; set; }

    public double? Pressure { get; set; }

    public double? TangentialPressure { get; set; }

    public int? Twist { get; set; }

    public double? AltitudeAngle { get; set; }

    public double? AzimuthAngle { get; set; }
}
