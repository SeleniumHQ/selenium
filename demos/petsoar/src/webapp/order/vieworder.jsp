<%--
  - Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
  - Mike Cannon-Brookes,Patrick A Lightbody
  - All rights reserved.
  -
  - Redistribution and use in source and binary forms, with or without
  - modification, are permitted provided that the following conditions are met:
  -
  -     * Redistributions of source code must retain the above copyright
  - notice, this list of conditions and the following disclaimer.
  -     * Redistributions in binary form must reproduce the above copyright
  - notice, this list of conditions and the following disclaimer
  - in the documentation and/or other materials provided with the distribution.
  -     * Neither the name of the 'Wiley & Sons', 'Java Open Source
  - Programming' nor the names of the authors may be used to endorse or
  - promote products derived from this software without specific prior
  - written permission.
  -
  - THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
  - "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
  - LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
  - A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
  - OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
  - SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  - LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
  - DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
  - THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  - (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
  - OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  --%>

<%@ taglib uri="webwork" prefix="ww" %>
<%@ taglib uri="webwork" prefix="ui" %>
<html>
    <head>
        <title>Details for Order</title>
    </head>
    <body>

    <ww:push value="order">
    <table cellspacing="0" class="grid">
        <tr>
            <th width="200">Type</th>
            <th width="200">Name</th>
            <th>Price</th>
        </tr>
        <ww:iterator value="shoppingCart.pets">
            <tr>
                <td>
                    <a id="pet-<ww:property value="name"/>" href="<%= request.getContextPath() %>/inventory/viewpet.action?id=<ww:property value="id"/>">
                        <ww:property value="type"/>
                    </a>
                </td>
                <td><ww:property value="name"/></td>
                <td><ww:property value="price"/></td>
            </tr>
        </ww:iterator>
        <ww:if test="shoppingCart.pets.empty">
            <tr>
                <td colspan=3>
                    You have no pets in your cart at this time.
                </td>
            </tr>
        </ww:if>
    </table>

    <ww:if test="shoppingCart.pets.size > 0">

        <p>Total price: <ww:property value="totalPrice"/></p>
        <p>Status: <ww:property value="status"/></p>

        <form action="saveorder.action" method="post">

           <p>Shipping Information</p>
            <table cellspacing="0" class="grid">
                <ww:textfield label="'First Name'" name="'order.shipmentInfo.name.first'"/>
                <ww:textfield label="'Last Name'" name="'order.shipmentInfo.name.last'"/>
                <ww:textfield label="'Address 1'" name="'order.shipmentInfo.address.street1'"/>
                <ww:textfield label="'Address 1'" name="'order.shipmentInfo.address.street2'"/>
                <ww:textfield label="'City'" name="'order.shipmentInfo.address.city'"/>
                <ww:textfield label="'State'" name="'order.shipmentInfo.address.state'"/>
                <ww:textfield label="'Zip Code'" name="'order.shipmentInfo.address.zip'"/>
            </table>

            <p>Billing Information</p>
            <table cellspacing="0" class="grid">
                <ww:textfield label="'First Name'" name="'order.billingInfo.name.first'"/>
                <ww:textfield label="'Last Name'" name="'order.billingInfo.name.last'"/>
                <ww:textfield label="'Address 1'" name="'order.billingInfo.address.street1'"/>
                <ww:textfield label="'Address 1'" name="'order.billingInfo.address.street2'"/>
                <ww:textfield label="'City'" name="'order.billingInfo.address.city'"/>
                <ww:textfield label="'State'" name="'order.billingInfo.address.state'"/>
                <ww:textfield label="'Zip Code'" name="'order.billingInfo.address.zip'"/>
            </table>

            <p>Credit Card Information</p>
            <table cellspacing="0" class="grid">
                <ww:textfield label="'Number'" name="'creditCardInfo.creditCardNumber'" />
                <ww:textfield label="'Last Name'" name="'creditCardInfo.expirationDate'"/>

                <ww:select label="'Type'" name="'creditCardInfo.cardType'" list="{'Master Card','American Express','Visa','Unknown'}"/>
            </table>

            <input type="hidden" name="id" value="<ww:property value="id"/>">
            <input type="submit" value="Save"/>

        </form>
       </ww:if>
    </ww:push>
    </body>
</html>