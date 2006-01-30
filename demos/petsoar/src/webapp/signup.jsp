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
    <title>Signup</title>
</head>

<body>
<form action="signup.action">
    <table class="form">
        <ww:textfield label="'Username'" name="'username'" />
        <ww:password label="'Password'" name="'password'" />
        <ww:password label="'Password (again)'" name="'verifyPassword'" />

        <tr><td colspan="2"><hr/><td></tr>

        <ww:select label="'Prefix'" name="'name.prefix'" list="{'Mr.', 'Mrs.', 'Dr.', 'Miss'}" />
        <ww:textfield label="'First Name'" name="'name.first'" />
        <ww:textfield label="'Middle Name'" name="'name.middle'" />
        <ww:textfield label="'Last Name'" name="'name.last'" />

        <tr><td colspan="2"><hr/><td></tr>

        <ww:textfield label="'Address 1'" name="'address.street1'" />
        <ww:textfield label="'Address 2'" name="'address.street2'" />
        <ww:textfield label="'City'" name="'address.city'" />
        <ww:textfield label="'State'" name="'address.state'" />
        <ww:textfield label="'Zip'" name="'address.zip'" />

        <tr><td colspan="2"><hr/><td></tr>

        <tr>
            <td colspan="2"><input type="submit" id="Signup" value="Signup"/></td>
        </tr>
    </table>
</form>

</body>
</html>

