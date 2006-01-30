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
        <title>Pet Categories</title>
    </head>
    <body>

    <form action="search.action" method="get">
        <table class="form">
            <ui:textfield label="'Search'" name="'query'"/>
        </table>
    </form>

        <p>
        You can also just <a href="listpets.action">list all pets</a>.
        </p>

        <p>
            <b>Category hierarchy:</b><br>
            <a href="listcategories.action">Root</a>

            <ww:if test="categoryId != null">
                    &gt;
                    <ww:iterator value="hierarchy" status="status">
                        <a href="listcategories.action?categoryId=<ww:property value="id" />"><ww:property value="name" /></a>
                        <ww:if test="#status.last == false">
                            &gt;
                        </ww:if>
                    </ww:iterator>
            </ww:if>
        </p>

        <p>
        <b>Subcategories:</b><br>

        <ww:if test="categories.empty == true">
            <ww:if test="categoryId == null">
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
					<tr href="listcategories.action<ww:if test="id != null">?categoryId=<ww:property value="id"/></ww:if>">
						<td>
							<a href="listcategories.action?categoryId=<ww:property value="id"/>">
								<ww:property value="name"/>
							</a>
						</td>
					</tr>
				</ww:iterator>
			</table>
            </p>
		</ww:else>

        <b>Pets:</b><br>
        <table cellspacing="0" class="grid">
                <tr>
					<th width="200">Name</th>
				</tr>
                <ww:iterator value="pets">
                    <tr>
                        <td class="cell">
                            <a href="viewpet.action?id=<ww:property value="id"/>">
                                <ww:property value="name"/>
                            </a>
                        </td>
                    </tr>
                </ww:iterator>
            </table>
    </body>
</html>