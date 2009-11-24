/*
JsUnit - a JUnit port for JavaScript
Copyright (C) 1999,2000,2001,2002,2003,2006 Joerg Schaible

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * The common interface for simple Monies and MoneyBags
 */
function IMoney() 
{
}

/**
 * Adds a money to this money.
 */
IMoney.prototype.add = function ( money ) {};
/**
 * Adds a simple Money to this money. This is a helper method for
 * implementing double dispatch
 */
IMoney.prototype.addMoney = function ( money ) {};
/**
 * Adds a MoneyBag to this money. This is a helper method for
 * implementing double dispatch
 */
IMoney.prototype.addMoneyBag = function ( moneyBag ) {};
/**
 * Tests whether this money is zero
 */
IMoney.prototype.isZero = function () {};
/**
 * Multiplies a money by the given factor.
 */
IMoney.prototype.multiply = function ( factor ) {};
/**
 * Negates this money.
 */
IMoney.prototype.negate = function () {};
/**
 * Subtracts a money from this money.
 */
IMoney.prototype.subtract = function ( iMoney ) {};
/**
 * Append this to a MoneyBag m.
 */
IMoney.prototype.appendTo = function ( moneyBag ) {};

