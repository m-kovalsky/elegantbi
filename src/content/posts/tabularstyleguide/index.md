---
title: "Tabular Style Guide"
description: "Naming and formatting standards for Tabular models."
pubDate: 2019-12-09T14:30:02.272Z
updatedDate: 2020-11-16T09:31:22.567Z
categories: ["Documentation", "Best Practices"]
heroImage: ./cover.jpg
---

Many coding languages have style guides which aid developers in producing content in a consistent and easily-readable format. It's time this comes to Tabular modeling. I see many cases where models are created with the mindset of a 'back-end' engineer despite the fact that models are actually used as part of the 'front-end'. Tables, Columns, Measures, Hierarchies and KPIs are viewed and used by business users and therefore your model's naming and formatting style should be created in their best interest.

The Tabular Style Guide becomes even more important as your platform scales to more users and more data models. This guide provides a way to optimize the user experience from an aesthetic perspective yet also provides consistency for users and developers across models. It should be seamless for users to transition to different models on your platform - only having to learn the business context unique to each model. Using one model on your platform should be like riding a bike - once you know how to ride one you can ride any.

The style guide itself is segmented by the components that comprise a tabular model (Tables, Partitions, Columns, Measures, Hierarchies, Relationships, Data Sources, Perspectives, Roles, and Display Folders). However, the first section covers general rules that apply to all model objects.

Before jumping into the style guide itself I'd like to mention that many of these rules can be coded and automatically validated by using [Tabular Editor](https://github.com/otykier/TabularEditor/releases)'s [Best Practice Analyzer](https://docs.tabulareditor.com/Best-Practice-Analyzer.html). This will eliminate some manual processes and allow you to focus on the higher-level aspects of your platform.

## General Rules

These rules apply to all model objects.

- Always separate words with spaces in all visible objects
- Always use [Title Case](https://titlecase.com/)
- Avoid these characters: \[ \] { } ' " = & \* : ; . / \\ # @ ! \_ = ^
- Avoid these words:
  - Any reserved words (i.e. Table, Measure, Column, KPI) except in the case of a Hierarchy being called a Hierarchy
  - Total
    - To avoid subtotals or grand totals showing as 'Total Total...'
  - Is
    - To avoid columns such as 'IsActive' instead of 'Active Flag' as instructed within the Columns section
  - Amount, Value
    - Oftentimes these terms are inherently obvious and thus don't need to be stated. For example, a measure named 'Sales Amount' can just be 'Sales'.
  - Name
    - Sometimes this is permissible (i.e. 'Customer Name'). However, oftentimes it is superfluous (i.e. 'Region Name' can just be 'Region').

## Tables

- Avoid these words: Hierarchy
- Calendar Dimension
  - Always mark as date table
  - Primary key (DateId) must be [`INTEGER`](https://dax.guide/dt/integer/) datatype in YYYYMMDD format
  - Always split date and time (Calendar granularity is 'Day' and Time is more granular (i.e. hour or minute)
- There are 5 types of tables. Use the examples below as a reference for naming tables in the model and in the database layer.
  - Fact table
    - Table name in model: Revenue
    - View name in database: FACT\_Revenue
  - Dimension table
    - Table name in model: Geography
    - View name in database: DIM\_Geography
  - Bridge table
    - Table name in model: GeographyBridge
    - View name in database: BRIDGE\_Geography
  - Security table
    - Table name in model: UserGeography
    - View name in database: SEC\_UserGeography
  - [Metadata](/post/datadictionary) table
    - Table name in model: Data Dictionary
    - View name in database: META\_DataDictionary

\**Note that GeographyBridge & UserGeography don't have spaces. That is permissible since they are hidden.*

## Partitions

- Single-partitioned tables must have the same Partition Name as Table Name
  - Always use views that are a simple `SELECT` \* `FROM` \[SchemaName\].\[ViewName\] (or equivalent). Views decouple the database layer tables from the tabular model and make it possible to make quick changes (if necessary) and allow multiple models to query the same table (one model may filter the table in different ways than another model). Not specifying the individual columns makes development much faster - especially when using Tabular Editor.
  - Views should have no logic. All the logic should be within stored procedures (or equivalent) and part of creating the underlying tables within the database layer.
  - View schema should be the model name (abbreviated as appropriate) appended by 'View' (i.e. for the Worldwide Importers model: \[WWIView\])
- Multi-partitioned tables must have Partition Names that start with the Table Name
  - See partition examples below based on: Table Name = Revenue
    - Revenue FY19; Revenue FY20; Revenue FY21
    - Revenue FY19-Q1; Revenue FY19-Q2; Revenue FY19-Q3
    - Revenue FY19-M01; Revenue FY19-M02; Revenue FY19-M03
  - Multi-partitioned tables should be partitioned in the database layer as well. This enables them to be created in parallel (in the database layer) which saves time. And, the partitioned tables can be easily queried with `SELECT` \* `FROM` clauses as done with the views above. The other option is to call a stored procedure from the partition query which uses a parameter as a filter within a select statement going back to the database layer.

## Columns

- Flags
  - Must be [`STRING`](https://dax.guide/dt/string/) datatype
  - Valid values: Yes, No, N/A, Unknown
  - Never use 0/1 or Y/N
  - Must be specified as a flag (i.e. Active Flag)
- Primary keys
  - Must be [`INTEGER`](https://dax.guide/dt/integer/) datatype
  - Must end in 'ID'
  - Marked in properties as Key = True
  - In general should be hidden unless needed by end-user
- Foreign keys
  - Must be [`INTEGER`](https://dax.guide/dt/integer/) datatype
  - Must end in 'ID'
  - Must be hidden
  - Matches the name of the corresponding primary key
- Sort-by-columns
  - Must be [`INTEGER`](https://dax.guide/dt/integer/) datatype
  - Must be hidden
- Aggregatable columns
  - Must be INTEGER, CURRENCY or DECIMAL datatype
  - Must be hidden and a measure created using the column
  - No spaces in the column name
- Non-aggregatable integer columns
  - Must be specified as 'None' or 'Do Not Summarize' in the 'Summarize By' property. This is to avoid non-aggregatable columns from being aggregated.
- Columns in database layer (including views) should not have spaces. Spaces are added within the model in the 'Name' property of the column.
- References
  - Columns referenced by measures should always be prefixed with the table name
- Dimension table primary keys should contain all the values within each related fact table's foreign keys - no blank members
- Specify URLs/hyperlinks as Data Category = WebURL in the column properties

## Measures

- Formatting
  - Currency, no decimals (i.e. $32,000)
    - \\$#,0;(\\$#,0);\\$#,0
  - Whole number, no decimals, commas (i.e. 32,000)
    - #,0
    - Some circumstances may require a decimal (#,0.0). Use as few decimals as possible and make sure not to use decimals when it is not appropriate (i.e. counting customers)
  - Percentage, one decimal, commas (i.e. 3,200.1%)
    - #,0.0%;-#,0.0%;#,0.0%
    - Some circumstances may require more than one decimal. Use as few decimals as possible to keep numbers clean.
- Naming
  - Descriptive but as brief as possible (see examples below)
  - Prefixes
    - Avg
    - Any product information (see the example shown below)
  - Suffixes
    - YoY, QoQ, MoM, YTD, QTD, MTD, PY, PQ, PM, TTM, VTB, VTF
    - YoY %, QoQ %, MoM %
    - % sign always goes at the end
  - Examples
    - `Billed Revenue`
    - `Billed Revenue` `PM`
    - `Billed Revenue` `MoM`
    - `Billed Revenue` `MoM %`
    - `Billed Revenue` `YoY`
    - `Billed Revenue YoY %`
    - `Billed Revenue` `PY`
    - `Billed Revenue` `YTD PY`
    - `Billed Revenue` `YTD YoY %`
    - `Azure` `Billed Revenue` `YTD`
    - `Azure` `Billed Revenue` `Customer Count` `TTM`
- References
  - Measures referenced by other measures should never be prefixed with the table name

*Key:*

*YoY = Year-over-Year*

*QoQ = Quarter-over-Quarter*

*MoM = Month-over-Month*

*YTD = Year-to-Date*

*QTD = Quarter-to-Date*

*MTD = Month-to-Date*

*PY = Previous Year*

*PQ = Previous Quarter*

*PM = Previous Month*

*TTM = Trailing 12 months*

*VTB = Variance-to-Budget*

*VTF = Variance-to-Forecast*

## Hierarchies

- Must be suffixed with the word 'Hierarchy' (i.e. 'Geography Hierarchy')
- Attributes of the hierarchy must use the same names as their respective columns outside the hierarchy
- Order of the hierarchy must correspond to the natural order of the hierarchy (in terms of granularity and drilling down)

## Relationships

- Relationships are named automatically so there is no need for naming standards

## Data Sources

- There should be 3 components to the data source name: Provider, Data Source, Initial Catalog
  - Example: SqlServer ServerName DatabaseName

## Perspectives

- There are no additional standards for perspectives outside of the General Rules stated above.

## Roles

- Role members must not overlap between roles. If a user is part of multiple roles it may cause errors for that user or show data that the user is not permitted to see.

## Display Folders

- Folders may be used to group 2 or more measures/columns within the same table.
- If using a multi-folder (drill) approach, make sure it is done in the way that your user categorizes such measures/columns

---

## Conclusion

The aesthetics of your model are equally important as the data within it. Following a set of standards creates a level of professionalism that further establishes the credibility of your data and the quality of your team. The consistency within models that uphold these standards bears rewards to the developers, stakeholders, and users. Development is faster and more effective, collaborative development is easier, and the user experience is much more pleasant and intuitive. As such, these standards are in the best interest of all parties and should be followed in order to create an elegant solution.
