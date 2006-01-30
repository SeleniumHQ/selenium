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
        <title>Pet Inventory</title>
    </head>
    <body>

    <table border="0" cellpadding="5">
    <tr>
        <td valign="top">
            <ww:if test="pets.empty == true">
                <p>There are no Pets in the store.</p>
            </ww:if>

            <ww:else>
                <table cellspacing="0" class="grid" width="300">
                    <tr>
                        <th width="200">Name</th>
                        <th>Gender</th>
                    </tr>
                    <ww:iterator value="pets">
                        <tr onmouseover="rowHover(this)" title="<ww:property value="description"/>" href="viewpet.action?id=<ww:property value="id"/>">
                            <td>
                                <a href="viewpet.action?id=<ww:property value="id"/>">
                                    <ww:property value="name"/>
                                </a>
                            </td>
                            <td>
                                <ww:property value="gender"/>
                            </td>
                        </tr>
                    </ww:iterator>
                </table>
            </ww:else>

            <p>
                <a href="listpets.action">Refresh</a> &nbsp;
                <a href="addpet.jsp">Add New Pet</a>
            </p>
        </td>
        <td valign="top">
            <h2 align="right">All Pets</h2>
            <p><font size="-1">
                This page displays all the pets in the database -- not organized by category. The page is built
                using a simple iterator (webwork:iterator tag) that loops over the list of pets, display a row
                pet Pet. You can find out more about <a href="http://www.opensymphony.com/webwork">WebWork</a>
                tags such as webwork:iterator in <b>Chapters 6 and 16</a>
            </font></p>
        </td>
    </tr>
    </table>

    </body>
</html>