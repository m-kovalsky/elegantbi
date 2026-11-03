---
title: "Model Auto Build"
description: "Dynamically create a tabular model based on an Excel template."
pubDate: 2020-06-22T13:55:08.665Z
updatedDate: 2020-11-16T09:32:41.362Z
categories: ["Automation", "Best Practices"]
heroImage: ./cover.png
---

I'd like to share with you an open source tool and framework I built that dynamically creates a tabular model based on an Excel template. Currently, there is no standard framework people use when developing a tabular model - there is no blueprint. Imagine a house being built without a blueprint - it just doesn't happen. And if it did, it would not have the best chance of being successful. This framework introduces a blueprint for creating a model. And, once the blueprint is created the model literally builds itself in just a few seconds. All of this is completed without ever touching Power BI Desktop, SSDT, or even Tabular Editor.

This tool is compatible for the following destinations of tabular models: [SQL Server Analysis Services](https://docs.microsoft.com/en-us/analysis-services/instances/install-windows/install-analysis-services?view=asallproducts-allversions), [Azure Analysis Services](https://azure.microsoft.com/en-us/services/analysis-services/), and [Power BI Premium](https://powerbi.microsoft.com/en-us/power-bi-premium/).

Here is a link to the tool: [https://github.com/m-kovalsky/ModelAutoBuild](https://github.com/m-kovalsky/ModelAutoBuild)

## Background

I worked with a Power BI customer recently that was attempting to build a tabular model based on an existing SQL Data Warehouse but had not been able to gain traction in developing the model. Being in an advisory role, I was brought in not to build the model but to provide them with the foundation for the model that someone could then use to quickly build the model. After viewing the requirements and their data warehouse, I created an Excel workbook outlining all the elements they would need in their model - tables, columns, measures, relationships as well as the properties of these elements. The customer was delighted by this and was able to leverage it to gain traction in building the model.

The more I thought about this the more I wondered about further automation. Given the model elements in an Excel file - a sort of template - could we have the model build itself? Well, that is precisely what Model Auto Build does. Much thanks to the [Advanced Scripting](https://github.com/otykier/TabularEditor/wiki/Advanced-Scripting) feature within [Tabular Editor](https://github.com/otykier/TabularEditor/releases) which leverages the [TOM API](https://docs.microsoft.com/en-us/analysis-services/tom/introduction-to-the-tabular-object-model-tom-in-analysis-services-amo?view=asallproducts-allversions).

## Purpose

The purpose of Model Auto Build is to provide a framework where a team can lay out the blueprint of their model *before* building it. Teams that implement the [Kimball Methodology](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dw-bi-lifecycle-method/) should be familiar with this construct.

Additionally, once the blueprint is created, Model Auto Build speeds up the time for development since practically the entire model can be laid out in the blueprint. That being said, I don't expect folks to have all the DAX for their model entered into the Excel template before their model is built. However, one can certainly lay out the base measures and create the foundation for their model. The DAX for more advanced measures can be determined by querying the initial model built by Model Auto Build in [SSMS](https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms?view=sql-server-ver15), [DAX Studio](https://daxstudio.org/), or [Power BI Desktop](https://powerbi.microsoft.com/en-us/desktop/).

## How to Use This Tool

There is a full set of instructions on how to use this tool within the [GitHub page](https://github.com/m-kovalsky/ModelAutoBuild). Be sure to look through the ModelAutoBuild\_Example.xlsx file to see a fully completed template file. Additionally, use the notes on the column headers of each tab of the Excel template to guide your input. After completing the Excel template it is literally a matter of running two command prompt scripts (guidance provided on the GitHub page). The first script turns each tab of the Excel file into a text file. The second script reads the information on the text files as metadata and uses the .cs script to create a new .bim file with everything you specified in the Excel file. This .bim file can be deployed to SQL Server Analysis Services, Azure Analysis Services, or Power BI Premium ([XMLA Read/Write Endpoints](https://docs.microsoft.com/en-us/power-bi/admin/service-premium-connect-tools) must be enabled). If the Excel Template is specified as 'Power BI Premium' to 'Yes' in the Model tab, the .bim file will be enabled for overwriting existing Power BI Premium datasets. This allows you to fully manage your model in [Tabular Editor](https://github.com/otykier/TabularEditor/releases) (or [SSDT](https://docs.microsoft.com/en-us/sql/ssdt/download-sql-server-data-tools-ssdt?view=sql-server-ver15)) and use Power BI Desktop strictly as a data visualization tool.

## Relationships

If you don't enter the relationships for your model, Model Auto Build will auto-detect the relationships and create them. However, the columns must be in a specific format. First, it only makes relationships between fact and dimension tables (this is learned when each table is specified as a fact, dimension, bridge etc. table). Second, the columns used for relationships must end in 'Id'. Third, the columns used for relationships must be named after the dimension table. For example, if you have a fact table called 'Revenue' and a dimension table named 'Geography', the column used to relate these tables must be 'GeographyId' - for both the Revenue and Geography tables. This aids the relationship detection but is also generally a good practice.

## Conclusion

This tool provides a simple framework for organizing your model before building it and dynamically creates the model for you in order to speed up the development process. Having an Excel-based template provides a familiar environment for the vast majority of people. This tool shows the powerful automation capability of the TOM API and Advanced Scripting feature within Tabular Editor.

It is important to mention here that this tool does not necessarily ensure that your model is of the highest standard. However, it attempts to promote better practices. One example is the best practice of not using logic in the partition queries. A second example is to provide proper formatting to measures (a drop-down menu simplifies this procedure). Further, the auto-creation of the model allows you to spend less time on simple development (tables, columns, relationships, base measures) and more time on more advanced tasks such as writing DAX for complicated business requirements.
