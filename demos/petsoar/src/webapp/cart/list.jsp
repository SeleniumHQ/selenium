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
        <title>Pet Shopping Cart</title>
    </head>
    <body>
    <table border="0" cellpadding="5">
    <tr>
        <td valign="top" width="300">

        <ww:if test="pets.empty == true">
            <p>There are no Pets in your cart.</p>
        </ww:if>

        <ww:else>
			<table cellspacing="0" class="grid">
				<tr>
					<th width="200">Name</th>
					<th>Gender</th>
					<th>Price</th>
                    <th>&nbsp;</th>
				</tr>
				<ww:iterator value="pets">
					<tr onmouseover="rowHover(this)" title="<ww:property value="description"/>" href="/storefront/viewpet.action?id=<ww:property value="id"/>">
						<td>
							<a id="pet-<ww:property value="name"/>" href="/storefront/viewpet.action?id=<ww:property value="id"/>">
								<ww:property value="name"/>
							</a>
						</td>
						<td>
                            <ww:property value="gender"/>
                        </td>
						<td>
                            <ww:property value="price"/>
                        </td>
                        <td>
                            <a id="del-<ww:property value="name"/>" href="removepet.action?petId=<ww:property value="id"/>">Del</a>
                        </td>
					</tr>
				</ww:iterator>
			</table>

            <p>
            <a id="checkOut" href="<%= request.getContextPath() %>/order/checkout.action">Check out now...</a>
		</ww:else>

        </td>
        <td valign="top">
        <h2 align="right">IoC and Services</h2>
        <p><font size="-1">
            The shopping cart is a perfect example of scoped services discussed in <b>Chapter 14</b>, called
            <i>Inversion of Control</i>. The particular service that is used here, the shopping cart, is session-scoped
            and has it's lifecycle managed by the simple IoC container provided by WebWork. You can read about how
            the shopping cart was built in <b>Chapter 19</b>.
        </font></p>
        </td>
    </tr>
    </table>
    </body>
</html>