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
 * A simple Money.
 *
 * Constructs a money from the given amount and currency.
 */
function Money( theAmount, theCurrency ) 
{
    this.fAmount = theAmount;
    this.fCurrency = theCurrency;
}
/**
 * Adds a money to this money. Forwards the request to the addMoney helper.
 */
function Money_add( money ) 
{
    return money.addMoney( this );
}
function Money_addMoney( money ) 
{
    if( money.currency() == this.currency())
        return new Money( this.amount() + money.amount(), this.currency());
    return new MoneyBag.prototype.create( this, money );
}
function Money_addMoneyBag( moneyBag ) 
{
    return moneyBag.addMoney( this );
}
function Money_amount() 
{
    return this.fAmount;
}
function Money_currency() 
{
    return this.fCurrency;
}
function Money_equals( object ) 
{
    if( object instanceof MoneyBag )
        return this.isZero() && object.isZero();

    if( object instanceof Money ) 
    {
        return    object.currency() == this.currency()
               && this.amount() == object.amount();
    }
    return false;
}
/*
public Money_int hashCode() 
{
    return fCurrency.hashCode()+fAmount;
} 
*/
function Money_isZero() 
{
    return this.amount() == 0;
}
function Money_multiply( factor ) 
{
    return new Money( this.amount() * factor, this.currency());
}
function Money_negate() 
{
    return new Money( -this.amount(), this.currency());
}
function Money_subtract( money ) 
{
    return this.add( money.negate());
}
function Money_toString() 
{
    return "[" + this.amount() + " " + this.currency() + "]";
}
function Money_appendTo( m ) 
{
    m.appendMoney( this );
}
Money.prototype.add = Money_add;
Money.prototype.addMoney = Money_addMoney;
Money.prototype.addMoneyBag = Money_addMoneyBag;
Money.prototype.amount = Money_amount;
Money.prototype.currency = Money_currency;
Money.prototype.equals = Money_equals;
Money.prototype.isZero = Money_isZero;
Money.prototype.multiply = Money_multiply;
Money.prototype.negate = Money_negate;
Money.prototype.subtract = Money_subtract;
Money.prototype.toString = Money_toString;
Money.prototype.appendTo = Money_appendTo;
Money.prototype.fAmount = 0.0;
Money.fulfills( IMoney );

