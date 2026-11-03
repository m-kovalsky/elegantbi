---
title: "Rectifying the Misconceptions of XMLA Read/Write"
description: "Learn the importance of enabling XMLA Read/Write"
pubDate: 2022-05-02T13:01:58.342Z
updatedDate: 2022-05-03T08:17:39.312Z
categories: ["Power BI Premium", "Best Practices", "Tabular Optimization"]
heroImage: ./cover.png
---

It appears that there is a misplaced fear of enabling [XMLA Read/Write](https://docs.microsoft.com/power-bi/enterprise/service-premium-connect-tools) - that somehow doing this may cause problems. I'd like to take this opportunity to dispel these erroneous beliefs as enabling XMLA Read/Write is perhaps the most important step you can take to advance your Power BI platform.

## The #1 Concern

The major concern people tend to have in this regard is that they will no longer be able to download the Power BI Desktop (.pbix) file from the service if the dataset has been modified using XMLA. At first this seems like a genuine concern - not being able to retrieve the Power BI Desktop file appears to be problematic. However, this is not actually a problem as I will demonstrate.

## The Optimal Development Process for Power BI Models

The reason that not being able to download the Power BI Desktop file from the Power BI service is not a problem, is that this action would never be taken (and never need to be taken) when using the optimal development process for building Power BI datasets and reports. For me to explain this, let's dig deeper into the optimal development process.

1. Create your Power BI model using [Tabular Editor](https://tabulareditor.com/) (version 2 or 3).
2. Deploy your model (using Tabular Editor) to your Premium Workspace.
3. Open Power BI Desktop and connect directly to your newly created Power BI dataset.
4. Create your Power BI report within Power BI Desktop.
5. Publish your Power BI report to the Power BI service.

After following these simple steps, you now have a Power BI dataset in your Power BI Premium workspace and a Power BI report which pulls from the aforementioned Power BI dataset. The report itself holds no data - all the data is in the dataset.

Want to change the Power BI report? Open the Power BI Desktop file, make your changes, and re-publish the report to the Power BI service.

Want to change the Power BI dataset? Open Tabular Editor, connect to your locally saved (.bim) file, make your changes, and re-deploy it to the Power BI workspace.

If you follow this process, you will never be bogged down by the quandary of trying to download a Power BI Desktop file which has been modified using XMLA. It will simply never happen as it is no part of the process.

## Extra Advantage of this Method

One additional advantage of using this method is that in naturally splits the model (dataset) and report into 2 components. This is useful as in many cases (especially in enterprise scenarios) the people developing the model/dataset are different than the people creating the report. This allows a separate non-competing environment for each. It also allows the best tool to be used for each function (Tabular Editor for model creation and Power BI Desktop for report building).

## Why can't I download a Power BI Desktop file which has been modified using XMLA?

This is due to what is formally referred to as the lack of Power BI Desktop 'hardening'. All this means is that there is work which needs to be done in Power BI Desktop itself for it to properly handle XMLA modifications such that it can be downloaded. Anyways, we now know that this is not to be a concern.

## What if I already built my model/Report in Power BI Desktop?

This is also not a problem. Follow the steps below:

1. Open your model/report in Power BI Desktop.
2. Open [Tabular Editor](https://tabulareditor.com/) as an External Tool (from Power BI Desktop).
3. Save the .bim file (or [save-to-folder](https://docs.tabulareditor.com/te2/Advanced-features.html#folder-serialization)) (optional)
4. Deploy the model to your Premium Workspace.
5. Reconnect your Power BI report to point to the newly created dataset on your Premium Workspace.

## Are there other advantages of enabling XMLA Read/Write?

Absolutely - there are tons! First off, being to use [Tabular Editor](https://tabulareditor.com/) for your data modeling is a gigantic advantage in itself. This alone will significantly advance your development capabilities. Additionally, you will be able to take advantage of all of Tabular Editor's capabilities such as 'offline changes' (modeling changes are instantaneous so the speed of development is tremendously fast), [advanced scripting](https://docs.tabulareditor.com/te2/Advanced-Scripting.html), DAX formatting, [command line deployment](https://docs.tabulareditor.com/te2/Command-line-Options.html), [Best Practice Analyzer](https://docs.tabulareditor.com/te2/Best-Practice-Analyzer.html), [Folder Serialization](https://docs.tabulareditor.com/te2/Advanced-features.html#folder-serialization), and the list goes on! Note that you will also now be able to properly use other great external tools such as [DAX Studio](https://daxstudio.org/) and [ALM Toolkit](http://alm-toolkit.com/).

## Can I take the optimal development process up another level using XMLA Read/Write?

Definitely! I showed just the basics but this can be taken much further. In my opinion, this can be enhanced in several ways.

First, make sure to use Tabular Editor's [Folder Serialization](https://docs.tabulareditor.com/te2/Advanced-features.html#folder-serialization) feature. This breaks down the .bim file into a folder structure which makes CI/CD significantly easier and also opens the opportunity for multi-user development scenarios.

Second, integrating Tabular Editor's [command line deployment](https://docs.tabulareditor.com/te2/Command-line-Options.html) feature into Azure DevOps will allow you to automate deployments of your Power BI datasets. [Daniel Otykier](https://twitter.com/DOtykier?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor) (the author of Tabular Editor) has a fantastic [blog series](https://tabulareditor.github.io/2019/02/20/DevOps1.html) on exactly this topic which will guide you on how to do it. The command line deployment even has options which allow you to run the Best Practice Analyzer (and the [Best Practice Rules](https://powerbi.microsoft.com/blog/best-practice-rules-to-improve-your-models-performance/)) to ensure that a dataset can only be deployed if it follows your specific rules. It even has an option to do a 'schema-check' and validate all columns back to the data source. You can take this to an even more advanced level in creating automated deployments through Azure DevOps. This is where once a model is checked into the master branch of Azure DevOps it automatically kicks off an Azure DevOps pipeline which runs the Best Practice Analyzer and (if all checks out) deploys your model to a set destination (i.e. your Power BI Premium Workspace). You can even then have the pipeline automatically process any tables/partitions which need processing (by automatically identifying any structural changes to your model/dataset). I have a script for that which I will share in a later post (although it is along the lines of the [Processing Manager](https://github.com/m-kovalsky/ProcessingManager) tool).

Third, you can now also take advantage of the plethora of tools and scripts which I have made available on [GitHub](https://github.com/m-kovalsky?tab=repositories). From using the [Processing Manager](https://github.com/m-kovalsky/ProcessingManager) to simplify advanced processing scenarios to using the [Mini Model Builder](https://github.com/m-kovalsky/MiniModelBuilder) to create, well, mini models. All of this is now possible by enabling XMLA Read/Write.

Lastly, you can now take advantage of the [backup/restore](https://docs.microsoft.com/en-us/power-bi/enterprise/service-premium-backup-restore-dataset#how-to-perform-backup-and-restore) feature for Power BI. This is a common need for enterprise scenarios - whether it is regarding migration from A(AS) to Premium, moving datasets across workspaces, or keeping dataset backups for regulatory purposes. Enabling XMLA R/W will unlock this for your team. Note that this requires configuring [ADLS Gen2](https://docs.microsoft.com/azure/storage/blobs/data-lake-storage-introduction) (which is yet another key component of an optimized Power BI system).

## Conclusion

Let me also state that these are not just recommendations that seem good to me on the surface. These recommendations are based on my personal experience as a developer and analytics manager building Power BI models at Microsoft which stretch the bounds of the current technology. If this process works for such complicated scenarios as we have, I have a pretty good feeling that they will work just fine for your organization as well. Additionally, optimizing the development process will allow you to spend more cerebral capacity on areas that really require it - such as optimizing the performance of the data model/report. Or better yet, on actually extracting insights from your data to help your company make better decisions!
