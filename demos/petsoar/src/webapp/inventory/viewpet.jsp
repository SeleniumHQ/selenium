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

<%@ taglib uri="webwork" prefix="webwork" %>
<html>
<head>
    <title>View Pet</title>
</head>
<body>

<table border="0" cellpadding="5">
<tr>
    <td valign="top" width="300">
        <webwork:if test="actionErrors == null || actionErrors.size() == 0">
            <b>ID:</b> <webwork:property value="pet.id" /><br>
            <b>Name:</b> <webwork:property value="pet.name" /><br>
            <b>Gender:</b> <webwork:property value="pet.gender" /><br>
            <b>Price:</b> <webwork:property value="pet.price" /><br>
            <b>Description:</b> <webwork:property value="pet.description" /><br>
            <b>Category:</b> <webwork:property value="pet.category.name" /><br>

            <p>
                <a href="editpetload.action?id=<webwork:property value="pet.id" />">Edit Pet</a>
                |
                <a href="removepetload.action?id=<webwork:property value="pet.id" />">Remove Pet</a>
            </p>
        </webwork:if>
        <webwork:else>
            Error/s occurred:

            <ul>
            <webwork:iterator value="actionErrors">
                <li><webwork:property />
            </webwork:iterator>
            </ul>
        </webwork:else>
    </td>
    <td valign="top">
    <h2 align="right">Type Conversion</h2>
    <p><font size="-1">
        It is interesting to note the format of the price for a Pet. Even though the domain object and the action itself
        only exposing the data as it's raw format (BigDouble), it is displayed on the web in a currency form. This is
        happening because there is a file, <i>Pet-conversion.properties</i>, that tells WebWork how to convert the price
        to a human-readible format (such as <webwork:property value="pet.price"/>).
    </font></p>
    </td>
</tr>
</table>

</body>
</html>