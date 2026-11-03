---
title: "Export Power BI Report Objects"
description: "Learn how to easily export metadata of visuals, filters and other objects within your Power BI report."
pubDate: 2021-08-23T13:30:05.865Z
updatedDate: 2021-10-28T08:34:41.903Z
categories: ["Documentation", "Automation", "Tools"]
heroImage: ./cover.png
---

Have you ever wondered which objects (tables, columns, measures etc.) are used within a Power BI report? How about which visual types are being used across a collection of Power BI reports? Or, if a report is using [custom visuals](https://powerbi.microsoft.com/developers/custom-visualization/)? Well, you're probably not the only one looking for such information. However, it's generally quite a manual process to get this info as it requires monotonously navigating through each visual and filter on each page of the report (and of course for all reports). Doing this manually would take a very long time and probably would not even be accurate since it is such a long and tedious process. No longer!

## The Method

Previously, I wrote a blog post on an automated method for [exporting report-level measures](/post/reportlevelmeasures) and migrating them back to the data model. The solution for getting the report objects is quite similar - although a bit more involved. The parallel between these solutions is that they require 'hacking' into the [Power BI Desktop](https://powerbi.microsoft.com/desktop/) (or [Power BI Template](https://docs.microsoft.com/power-bi/create-reports/desktop-templates)) file and parsing through the 'Layout.json' file that is hidden beneath all Power BI reports. This 'Layout.json' file contains all the report-level metadata - including information on all the pages, visuals, filters, bookmarks, custom visuals, report-level measures and more.

## The Solution

To streamline the process of collecting the report object metadata, I wrote a [C# script](https://github.com/m-kovalsky/Tabular/blob/master/ExportReportObjects.cs) which I have posted to [GitHub](https://github.com/m-kovalsky/Tabular). The script is to be executed in the [Advanced Scripting](https://docs.tabulareditor.com/Advanced-Scripting.html) window within [Tabular Editor](https://tabulareditor.com/). It should be noted that in this capacity, Tabular Editor is functioning simply for the purpose of code-simplification and convenience (the model which is loaded into Tabular Editor before running this script does not matter).

Also, this script is able to collect the report objects for either a single Power BI report file or a collection of Power BI report files within a specified folder!

## The Steps

1. Download the [C# script](https://github.com/m-kovalsky/Tabular/blob/master/ExportReportObjects.cs) from GitHub.
2. Copy and paste the C# script into the [Advanced Scripting](https://docs.tabulareditor.com/Advanced-Scripting.html) window in [Tabular Editor](https://tabulareditor.com/).
3. \*Open/connect to any model in Tabular Editor (or even click 'File-\>New Model' to create a new model).
4. Update the 'pbiFolderName' parameter to the folder which contains the Power BI report(s).
5. If you want the script to only scan a single Power BI report, specify the report's file name (and extension) in the 'pbiFile' parameter. If you want the script to scan all the Power BI reports within the aforementioned folder, ensure this parameter is set to be blank: @"";
6. If you want the report objects to be saved (to the same folder as specified in Step 4), set the 'saveToFile' parameter to 'true'. Otherwise, set this to 'false' (in this case the script will share the output in a series of pop-up windows).
7. Click play (or press F5).

*\* Tabular Editor only allows you to run a C# script in the Advanced Scripting window if it is connected to a model. In this case, the script is not referencing the model which is loaded so it does not matter which model is actually loaded or if a new (blank) model is created (and then discarded).*

## The Output

The following shows the format of the output files:

- Report Filters
  - Report Name, Filter Name, Table Name, Object Name, Object Type, Filter Type
- Pages
  - Report Name, Page Id, Page Name, Page Number, Page Width, Page Height, Page Hidden Flag, Visual Count
- Page Filters
  - Report Name, Page Id, Page Name, Filter Name, Table Name, Object Name, Object Type, Filter Type
- Visuals
  - Report Name, Page Name, Visual Id, Visual Name, Visual Type, Custom Visual Flag, Visual Hidden Flag, X Coordinate, Y Coordinate, Z Coordinate, Visual Width, Visual Height, Object Count
- Visual Filters
  - Report Name, Page Name, Visual Id, Table Name, Object Name, Object Type, Filter Type
- Visual Objects
  - Report Name, Page Name, Visual Id, Visual Type, Custom Visual Flag, Table Name, Object Name, Object Type, Source
- Custom Visuals
  - Report Name, Custom Visual Name
- Bookmarks
  - Report Name, Bookmark Name, Bookmark Id, Page Id
- Connections
  - Report Name, Server Name, Database Name, Report Id, Connection Type
- Visual Interactions
  - Report Name, Page Name, Source Visual ID, Target Visual ID, Type ID, Type

*Note: 'Source' within Visual Objects shows as 'Standard' for objects used within rows/columns etc. of visual itself. Objects used for conditional formatting or to set titles, backgrounds etc. will show as such within the 'Source' column.*

## Next Steps

There are some cool things which you can do once you have this information. For example, with this information you have a generally better understanding of which parts of your model are used more often (and perhaps which are used less often or not at all). You could leverage this information to either trim down your model to only the elements needed within the report(s) or potentially use the [Master Model](/post/mastermodel) technique to dynamically generate '[mini-models](https://github.com/m-kovalsky/MiniModelBuilder)' tailored for specific reports (with only the objects necessary to generate those reports).

## Conclusion

This post continues a series of enabling metadata to be exported - whether its exporting [model metadata](/post/extractmodelmetadata), [report-level measures](/post/reportlevelmeasures), or report objects (as in this post). Gathering this information used to be quite challenging but now it's easy! Just note that this 'hacking' method is not officially supported by Microsoft - but it works!
