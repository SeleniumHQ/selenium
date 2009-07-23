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
 * A MoneyBag defers exchange rate conversions. For example adding 
 * 12 Swiss Francs to 14 US Dollars is represented as a bag 
 * containing the two Monies 12 CHF and 14 USD. Adding another
 * 10 Swiss francs gives a bag with 22 CHF and 14 USD. Due to 
 * the deferred exchange rate conversion we can later value a 
 * MoneyBag with different exchange rates.
 *
 * A MoneyBag is represented as a list of Monies and provides 
 * optional arguments to create a MoneyBag. 
 */
function MoneyBag() 
{
    this.fMonies = new Array();
}
function MoneyBag_create( iMoney1, iMoney2 ) 
{
    var result = new MoneyBag();
    iMoney1.appendTo( result );
    iMoney2.appendTo( result );
    return result.simplify();
}
function MoneyBag_add( money ) 
{
    return money.addMoneyBag( this );
}
function MoneyBag_addMoney( money ) 
{
    return MoneyBag.prototype.create( money, this );
}
function MoneyBag_addMoneyBag( moneyBag ) 
{
    return MoneyBag.prototype.create( moneyBag, this );
}
function MoneyBag_appendBag( moneyBag ) 
{
    for( var i = 0; i < moneyBag.fMonies.length; ++i )
        this.appendMoney( moneyBag.fMonies[i] );
}
function MoneyBag_appendMoney( money ) 
{
    if( money.isZero())
        return;
    var i = this.findMoney( money.currency());
    if ( i == null )
    {
        this.fMonies.push( money );
        return;
    }
    var old = this.fMonies[i];
    var sum = old.add( money );
    if( sum.isZero()) 
    {
        var monies = new Array();
        for( var j = 0; j < this.fMonies.length; ++j ) 
        {
            if( j != i )
                monies.push( this.fMonies[j] );
        }
        this.fMonies = monies;
    }
    else 
    {
        this.fMonies[i] = sum;
    } 
}
function MoneyBag_equals( object ) 
{
    if( object == null )
        return false;

    if( object instanceof Money )
        return this.isZero() && object.isZero();

    if( object instanceof MoneyBag ) 
    {
        if( object.fMonies.length != this.fMonies.length )
            return false;

        for( var i = 0; i < this.fMonies.length; ++i )
        {
            if( !object.contains(this.fMonies[i]))
                return false;
        }
        return true;
    }
    return false;
}
function MoneyBag_findMoney( currency ) 
{
    for( var i = 0; i < this.fMonies.length; ++i ) 
    {
        var money = this.fMonies[i];
        if( money.currency() == currency ) 
            return i;
    }
    return null;
}
function MoneyBag_contains( money ) 
{
    var i = this.findMoney( money.currency());
    return i != null && this.fMonies[i].amount() == money.amount();
}
/*
function MoneyBag_int hashCode() 
{
    int hash= 0;
    for( Enumeration e= fMonies.elements(); e.hasMoreElements(); ) 
    {
        Object m = e.nextElement();
        hash ^= m.hashCode();
    }
    return hash;
} 
*/
function MoneyBag_isZero() 
{
    return this.fMonies.length == 0;
}
function MoneyBag_multiply( factor ) 
{
    var result = new MoneyBag();
    if( factor != 0 )
    {
        for( var i = 0; i < this.fMonies.length; ++i ) 
            result.appendMoney( this.fMonies[i].multiply( factor ));
    }
    return result;
}
function MoneyBag_negate() 
{
    var result = new MoneyBag();
    for( var i = 0; i < this.fMonies.length; ++i )
        result.appendMoney( this.fMonies[i].negate());
    return result;
}
function MoneyBag_simplify() 
{
    if( this.fMonies.length == 1 )
        return this.fMonies[0];
    return this;
}
function MoneyBag_subtract( money ) 
{
    return this.add( money.negate());
}
function MoneyBag_toString() 
{
    var buffer = "{";
    for( var i = 0; i < this.fMonies.length; ++i )
        buffer = buffer + this.fMonies[i].toString();
    return buffer + "}";
}
function MoneyBag_appendTo( moneyBag ) 
{
    moneyBag.appendBag( this );
}

MoneyBag.prototype.create = MoneyBag_create;
MoneyBag.prototype.add = MoneyBag_add;
MoneyBag.prototype.addMoney = MoneyBag_addMoney;
MoneyBag.prototype.addMoneyBag = MoneyBag_addMoneyBag;
MoneyBag.prototype.appendBag = MoneyBag_appendBag;
MoneyBag.prototype.appendMoney = MoneyBag_appendMoney;
MoneyBag.prototype.equals = MoneyBag_equals;
MoneyBag.prototype.findMoney = MoneyBag_findMoney;
MoneyBag.prototype.contains = MoneyBag_contains;
MoneyBag.prototype.isZero = MoneyBag_isZero;
MoneyBag.prototype.multiply = MoneyBag_multiply;
MoneyBag.prototype.negate = MoneyBag_negate;
MoneyBag.prototype.simplify = MoneyBag_simplify;
MoneyBag.prototype.subtract = MoneyBag_subtract;
MoneyBag.prototype.toString = MoneyBag_toString;
MoneyBag.prototype.appendTo = MoneyBag_appendTo;
MoneyBag.fulfills( IMoney );
