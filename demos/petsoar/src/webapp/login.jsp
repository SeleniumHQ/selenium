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

<%@ taglib uri="webwork" prefix="ww"%>

<html>
<head>
    <title>Login</title>
</head>

<body>

<table border="0" cellpadding="5">
<tr>
    <td valign="top">
<form action="login.action">
<table class="form">
        <ww:textfield label="'Username'" name="'username'" />
        <ww:password label="'Password'" name="'password'" />

        <tr>
            <td><input type="submit" id="Login" value="Login"/></td>
            <td><a href="signup.jsp">Signup</a></td>
        </tr>
</table>
</form>

    </td>
    <td valign="top">
<h2 align="right">Security Note</h2>
<p><font size="-1">
    This page is displayed automatically by a Servlet Filter, SecurityWrapper, whenever any page requested that maps
    to the filter mapped in <b>web.xml</b>. The implementation chosen here does not differentiate one user from
    another user, meaning anyone has access to managing the store inventory. One could easily add Access Control List
    (ACL) support based upon this implementation to provide more fine-grained access. You can read more about security
    in <b>Chapter 20</b>
</font></p>
    </td>
</tr>
</table>

</body>
</html>

