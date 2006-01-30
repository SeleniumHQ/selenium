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
<%@ taglib uri="sitemesh-page" prefix="page" %>

<html>
    <head>
        <title>
            Edit Pet Details
        </title>
    </head>
    <body>
    <table border="0" cellpadding="5">
    <tr>
        <td valign="top">
            <page:applyDecorator name="petform">
                <page:param name="action">savepet.action</page:param>
                <page:param name="button">Edit</page:param>
                <page:param name="title">Edit A Pet</page:param>
                <page:param name="description">This form will edit an existing pet.</page:param>

                <ww:hidden name="'pet.id'"/>
                <ww:textfield label="'Name'" name="'pet.name'"/>
                <ww:select label="'Gender'" name="'pet.gender'" list="{'Unknown', 'Male', 'Female'}"/>
                <ww:textarea label="'Description'" name="'pet.description'" rows="'6'" cols="'40'"/>
                <ww:textarea label="'Personality'" name="'pet.personality'" rows="'6'" cols="'40'"/>
                <ww:textfield label="'Price'" name="'pet.price'" size="'7'"/>
                <ww:component template="category.vm" label="'Category'" name="'pet.category.id'" />
            </page:applyDecorator>
        </td>
        <td valign="top">
        <h2 align="right">UI Components</h2>
        <p><font size="-1">
            This page makes extensive use of <a href="http://www.opensymphony.com/sitemesh">SiteMesh</b> and
            <a href="http://www.opensymphony.com/webwork">WebWork</a> tags to provide a componentized layout. The
            SiteMesh page:applyDecorator tag is used to provide a standard form component, while the WebWork UI tags,
            including a custom webwork:component tag that provides the Category selector, give more fine-grained
            access to UI components such as drop-down selection lists and text fields. These topics are discussed in
            <b>Chapter 17</b>
        </font></p>
        </td>
    </tr>
    </table>
    </body>
</html>