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

<%@ taglib uri="sitemesh-decorator" prefix="decorator" %>
<%@ taglib uri="webwork" prefix="webwork" %>
<%
    String root = request.getContextPath();
    response.setHeader("Cache-Control", "none");
%>


<html>
<head>
    <title><decorator:title default="PetSoar" /></title>
    <link rel="stylesheet" type="text/css" href="<%=root%>/decorators/style.css">
    <script src="<%=root%>/decorators/effects.js"></script>
    <decorator:head />
</head>

<body leftmargin="0" rightmargin="0" topmargin="0" bottommargin="0" marginwidth="0" marginheight="0" text="#555555" vlink="#3333cc" link="#3333cc" alink="#3333cc">

<table border="0" cellpadding="0" cellspacing="0" height="100%">
<tr><td valign="top" bgcolor="#80AAFF">
    <table cellspacing="0" bgcolor="white" cellpadding="0" border="0" width="150">
        <tr>
            <td colspan="3" bgcolor="#eeeeee"><img src="images/trans.gif" border="0" height="1" width="150"><br>
                <a href="<%=root%>/"><img align="center" border="0" alt="" src="<%=root%>/images/bunny.gif" width="52" height="85" hspace="0" vspace="0" border="0" style="position:relative;top: 4"></a>
            </td>
        </tr>
        <tr>
            <td bgcolor="#990066" height="20"><img src="<%=root%>/images/trans.gif" border="0" height="1" width="20"></td>
            <td rowspan="14" bgcolor="#FFFFFF"><img src="<%=root%>/images/trans.gif" border="0" height="1" width="1"></td>
            <td bgcolor="#343466" width="129"><a class="navLink" href="<%=root%>/" id="PetStore">&nbsp;PetStore</a><br>
            </td>
        </tr>

        <%-- Menu item --%>
        <tr>
            <td><img src="<%=root%>/images/trans.gif" border="0" height="1" width="1"></td>
        </tr>
        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#9999CC" >
                <span class="navLink"></span> <a class="navLink" href="<%=root%>/inventory/" id="inventory">&nbsp;Inventory</a><br>
            </td>
        </tr>
        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#9999CC" >
                <span class="navLink"></span> <a class="navLink" href="<%=root%>/storefront/listpets.action" id="Pets">&nbsp;Pets</a><br>
            </td>
        </tr>
        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#9999CC" >
                <span class="navLink"></span> <a id="viewCart" class="navLink" href="<%=root%>/cart/list.action">&nbsp;Cart</a><br>
            </td>
        </tr>
        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#9999CC" >
                <span class="navLink"></span> <a id="checkOut" class="navLink" href="<%=root%>/order/checkout.action">&nbsp;Check Out</a><br>
            </td>
        </tr>
        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#9999CC">
                <form action="<%=root%>/storefront/search.action" method="get">
                    <input name="query" border="0" type="text" value="" size="5"/>
				   <input type="submit" id="Submit" value="Submit"/>
                </form>
            </td>
		   <td input type="submit" id="Submit" value="Submit"/></td>
        </tr>
        <tr>
            <td><img src="<%=root%>/images/trans.gif" border="0" height="1" width="1"></td>
        </tr>

        <tr>
            <td bgcolor="#80AAFF" colspan="3">&nbsp;</td>
        </tr>

        <tr>
            <td><img src="<%=root%>/images/trans.gif" border="0" height="1" width="1"></td>
        </tr>
        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#343466" width="129"><span class="navLink">&nbsp;User Bits</span><br>
        </tr>

        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#9999CC" >
                <span class="navLink">&nbsp;<b>Welcome</b>: <%= request.getRemoteUser() == null ? "Guest" : request.getRemoteUser() %></span>
            </td>
        </tr>

        <tr>
            <td bgcolor="#B6CBF8" height="20">&nbsp;</td>
            <td bgcolor="#9999CC" >
            <% if (request.getRemoteUser() != null) { %>
                <a class="navLink" href="<%=root%>/logout.action" id="Logout">&nbsp;Logout</a><br>
            <% } else { %>
                    <span class="navLink">
                    &nbsp;<a class="navLink" href="<%=root%>/login.jsp">Login</a> /
                    <a class="navLink" href="<%=root%>/signup.jsp">Signup</a>
                    </span>
                <br>
            <% } %>
            </td>
        </tr>
        <%-- End menu item --%>

        <tr>
            <td><img src="<%=root%>/images/trans.gif" border="0" height="1" width="1"></td>
        </tr>
        <tr>
            <td bgcolor="#80AAFF" colspan="3" valign="top"><img width="150" height="109" alt="" src="<%=root%>/images/left_bar_top.gif"></td>
        </tr>
    </table>
</td>
<td width="30">&nbsp;</td>
<td rowspan="2" valign="top">
    <img src="<%=root%>/images/trans.gif" alt="" width="1" height="20"><br>
    <h1 style="width:100%"><decorator:title default="PetSoar" /></h1>
    <font size="-1" face="arial">
        <decorator:body />
    </font>
</td>
<td width="20">&nbsp;</td>
</tr>
<tr>
    <td bgcolor="#80AAFF" valign="bottom"><img width="150" height="196" alt="" src="<%=root%>/images/left_bar_bottom.gif"></td>
</tr>
</table>
</body>
</html>
