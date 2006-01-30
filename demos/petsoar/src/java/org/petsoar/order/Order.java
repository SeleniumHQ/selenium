/*
 * Copyright (c) 2003-2005, Wiley & Sons, Joe Walnes,Ara Abrahamian,
 * Mike Cannon-Brookes,Patrick A Lightbody
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the 'Wiley & Sons', 'Java Open Source
 * Programming' nor the names of the authors may be used to endorse or
 * promote products derived from this software without specific prior
 * written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

package org.petsoar.order;

import java.math.BigDecimal;
import java.util.Set;

/**
 * @hibernate.class table="ORDERS"
 */
public class Order {
    public static final String ORDER_STATUS_PENDING = "Pending";
    public static final String ORDER_STATUS_SHIPPED = "Shipped";

    private long id;
    private ShipmentInfo shipmentInfo = new ShipmentInfo();
    private BillingInfo billingInfo = new BillingInfo();
    private CreditCardInfo creditCardInfo = new CreditCardInfo();
    private Set pets;
    private BigDecimal totalPrice = new BigDecimal(0d);
    private String status = ORDER_STATUS_PENDING;

    /**
     * @hibernate.id column="ORDERID" generator-class="increment" unsaved-value="0"
     */
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public ShipmentInfo getShipmentInfo() {
        return shipmentInfo;
    }

    public void setShipmentInfo(ShipmentInfo shipmentInfo) {
        this.shipmentInfo = shipmentInfo;
    }

    public BillingInfo getBillingInfo() {
        return billingInfo;
    }

    public void setBillingInfo(BillingInfo billingInfo) {
        this.billingInfo = billingInfo;
    }

    /**
     * @hibernate.component
     */
    public CreditCardInfo getCreditCardInfo() {
        return creditCardInfo;
    }

    public void setCreditCardInfo(CreditCardInfo creditCardInfo) {
        this.creditCardInfo = creditCardInfo;
    }

    /**
     * The total price.
     * @hibernate.property column="PRICE"
     */
    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    /**
     * @hibernate.set table="ODER_PETS" lazy="true"
     * @hibernate.collection-many-to-many class="org.petsoar.pets.Pet" column="PET_ID"
     * @hibernate.collection-key column="ORDER_ID"
     */
    public Set getPets() {
        return pets;
    }

    public void setPets(Set pets) {
        this.pets = pets;
    }

    /**
     * The status of the Order.
     * @hibernate.property column="STATUS"
     */
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        if (status.equals(ORDER_STATUS_PENDING) || status.equals(ORDER_STATUS_SHIPPED)) {
            this.status = status;
        } else {
            throw new IllegalArgumentException("Invalid orderStatus");
        }
    }
}
