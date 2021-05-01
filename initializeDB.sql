drop database canopy;
create database canopy;
use canopy;

CREATE TABLE `OwnerTable` (
  
`Id` INT NOT NULL AUTO_INCREMENT,
`OwnerName` Varchar(200) NOT NULL,
 `OwnerContact` VARCHAR(200) NOT NULL,
 `OwnerAddress` Varchar(200) NOT NULL,
`OwnerPassword` Varchar(200) NOT NULL,
 
  PRIMARY KEY (`Id`));



CREATE TABLE `TenantTable` (
  
`Id` INT NOT NULL AUTO_INCREMENT,
`TenantName` Varchar(200) NOT NULL,
 `TenantContact` VARCHAR(200) NOT NULL,
 `TenantAddress` Varchar(200) NOT NULL,
 `TenantPassword` Varchar(200) NOT NULL,
 
 PRIMARY KEY (`Id`));




CREATE TABLE`PaymentTable`(
`Id` INT NOT NULL AUTO_INCREMENT ,
`Date`date, 
`Buildingname` Varchar(200) NOT NULL,
`tName` Varchar(200) NOT NULL,
`FlatNum`Varchar(200) NOT NULL,
`PaidRent`double NOT NULL DEFAULT 0,
Key (`Buildingname`),
primary Key (`Id`));




CREATE TABLE`BuildingTable`(
`Id` INT NOT NULL AUTO_INCREMENT , 
`BuildingName` Varchar(200) NOT NULL,
`Address` Varchar(200) NOT NULL,
`Owner`varchar(200) NOT NULL,
`Floors`Varchar(200) NOT NULL,
Key (`BuildingName`),
primary Key (`Id`));


CREATE TABLE `ApartmentTable`(
`Id` INT NOT NULL AUTO_INCREMENT , 
`BuildingName` Varchar(200) NOT NULL,
`FlatNumber` Varchar(200) NOT NULL,
`Tenant`varchar(200) NOT NULL,
`Rent`DOUBLE NOT NULL DEFAULT 0,
`StartDate`date NOT NULL,
primary Key (`Id`), 

 INDEX par_ind (BuildingName),
  CONSTRAINT fk_branchTable FOREIGN KEY (BuildingName)
  	REFERENCES BuildingTable (BuildingName)
		ON DELETE CASCADE
  		ON UPDATE CASCADE );


SET FOREIGN_KEY_CHECKS = 0;
truncate tableName;
SET FOREIGN_KEY_CHECKS = 1;