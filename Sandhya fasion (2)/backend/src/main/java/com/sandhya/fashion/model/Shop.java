package com.sandhya.fashion.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "shops")
public class Shop {
    @Id
    private String id;
    private String ownerId;
    private String businessName;
    private String address;
    private String gstNo;
    private String phone;

    public Shop() {}

    public Shop(String ownerId, String businessName, String address, String gstNo, String phone) {
        this.ownerId = ownerId;
        this.businessName = businessName;
        this.address = address;
        this.gstNo = gstNo;
        this.phone = phone;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getGstNo() { return gstNo; }
    public void setGstNo(String gstNo) { this.gstNo = gstNo; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
