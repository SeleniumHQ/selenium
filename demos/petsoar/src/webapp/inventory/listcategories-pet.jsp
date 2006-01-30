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
        <title>Pet Inventory - Categories</title>
        <link rel="stylesheet" type="text/css" href="/decorators/style.css">
        <script src="/decorators/effects.js"></script>
    </head>
    <body>

        <div align="center"><h2>Category Picker</h2></div>

        <ww:if test="categories.empty == true">
            <div align="center"><h2>There are no Categories in the store.</h2></div>
        </ww:if>

        <ww:else>
			<table cellspacing="0" class="grid" align="center">
				<tr>
					<th width="200">Name</th>
                    <th>&nbsp;</th>
				</tr>
				<ww:iterator value="categories">
					<tr <ww:if test="categories.size > 0">href="listcategories-pet.action?parentId=<ww:if test="id != null"><ww:property value="id"/></ww:if><ww:else>0</ww:else>"</ww:if>>
						<td>
                            <ww:if test="categories.size > 0">
                                <a href="listcategories-pet.action?parentId=<ww:property value="id"/>">
                                    <ww:property value="name"/>
                                </a>
                            </ww:if>
                            <ww:else>
                                <ww:property value="name"/>
                            </ww:else>
						</td>
                        <td>
                            <input type="button" value="Add" onclick="window.opener.document.getElementById('categoryId').value=<ww:property value="id"/>;window.opener.document.getElementById('categoryName').value='<ww:property value="name"/>'; window.close()"/>
                        </td>
					</tr>
				</ww:iterator>
			</table>
		</ww:else>
    </body>
</html>