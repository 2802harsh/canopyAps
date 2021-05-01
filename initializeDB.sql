drop database canopy;
create database canopy;
use canopy;

CREATE TABLE OwnerTable (
  
Id INT NOT NULL AUTO_INCREMENT,
OwnerName Varchar(200) NOT NULL,
OwnerContact VARCHAR(200) NOT NULL,
OwnerAddress Varchar(200) NOT NULL,
OwnerPassword Varchar(200) NOT NULL,
 
PRIMARY KEY (Id)
);

CREATE TABLE BuildingTable(
Id INT NOT NULL AUTO_INCREMENT , 
BuildingName Varchar(200) NOT NULL,
Address Varchar(200) NOT NULL,
OwnerId INT NOT NULL,
Floors Varchar(200) NOT NULL,

PRIMARY KEY (Id),
FOREIGN KEY (OwnerId) REFERENCES OwnerTable(Id)
);

CREATE TABLE TenantTable (
  
Id INT NOT NULL AUTO_INCREMENT,
TenantName Varchar(200) NOT NULL,
TenantContact VARCHAR(200) NOT NULL,
TenantAddress Varchar(200) NOT NULL,
TenantPassword Varchar(200) NOT NULL,

PRIMARY KEY (Id)
);

CREATE TABLE ApartmentTable(
Id INT NOT NULL AUTO_INCREMENT , 
BuildingId INT NOT NULL,
FlatNumber Varchar(200) NOT NULL,
TenantId INT NOT NULL,
Rent DOUBLE NOT NULL DEFAULT 0,
StartDate date NOT NULL,

PRIMARY KEY (Id), 
FOREIGN KEY (BuildingId) REFERENCES BuildingTable(Id),
FOREIGN KEY (TenantId) REFERENCES TenantTable(Id)
);

CREATE TABLE PaymentTable(
Id INT NOT NULL AUTO_INCREMENT ,
Date date, 
BuildingId INT NOT NULL,
TenantId INT NOT NULL,
ApartmentId INT NOT NULL,
PaidRent double NOT NULL DEFAULT 0,

PRIMARY KEY (Id),
FOREIGN KEY (BuildingId) REFERENCES BuildingTable(Id),
FOREIGN KEY (TenantId) REFERENCES TenantTable(Id),
FOREIGN KEY (ApartmentId) REFERENCES ApartmentTable(Id)
);