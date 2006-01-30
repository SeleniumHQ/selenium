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
            <ww:if test="parentId == 0">
                <title>Pet Inventory - Categories</title>
            </ww:if>
            <ww:else>
                <title>Pet Inventory - Sub-Categories of <ww:property value="currentCategory.name" /></title>
            </ww:else>


        <script>
            function addCat() {
                var name = prompt("Category name", "");
                if (name != null && name != "") {
                    window.location = "addcategory.action?parentId=<ww:if test="parentId != null"><ww:property value="parentId"/></ww:if><ww:else>0</ww:else>&name=" + name;
                }
            }
        </script>
    </head>
    <body>

    <table border="0" cellpadding="5">
    <tr>
        <td valign="top" width="200">
        <p>
            <b>Category hierarchy:</b><br>
            <a href="listcategories.action">Root</a>

            <ww:if test="parentId != 0">
                    &gt;
                    <ww:iterator value="categoryHierarchy" status="status">
                        <a href="listcategories.action?parentId=<ww:property value="id" />"><ww:property value="name" /></a>
                        <ww:if test="#status.last == false">
                            &gt;
                        </ww:if>
                    </ww:iterator>
            </ww:if>
        </p>


        <ww:if test="categories.empty == true">
            <ww:if test="parentId == 0">
                <p>There are no categories.</p>
            </ww:if>
            <ww:else>
                <p>There are no subcategories.</p>
            </ww:else>
        </ww:if>
        <ww:else>
			<table cellspacing="0" class="grid">
				<tr>
					<th width="200">Name</th>
				</tr>
				<ww:iterator value="categories">
					<tr href="listcategories.action?parentId=<ww:if test="id != null"><ww:property value="id"/></ww:if><ww:else>0</ww:else>">
						<td>
							<a href="listcategories.action?parentId=<ww:property value="id"/>">
								<ww:property value="name"/>
							</a>
						</td>
					</tr>
				</ww:iterator>
			</table>
		</ww:else>

        <p>

        <ww:if test="parentId == 0">
            <a href="javascript: addCat();">Add new category</a>
        </ww:if>
        <ww:else>
            <a href="javascript: addCat();">Add new sub-category</a>
        </ww:else>

        </td>
        <td valign="top" class="note">
        <h2 align="right">Missing Features</h2>
        <p><font size="-1">
            You might notice that some features are missing from this page -- specifically the ability to delete
            categories. We didn't implement this because the implementation would be almost entirely the same as the
            feature that removes Pets from the database. In short: adding this feature shouldn't be more than a few
            lines of functional Java in a WebWork action that calls the <i>PetStore</i> service. You can read more about
            the PetStore service and the Hibernate persistence layer in <b>Chapter 15</b>
        </font></p>
        </td>
    </tr>
    </table>

    </body>
</html>