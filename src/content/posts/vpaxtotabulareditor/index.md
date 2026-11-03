---
title: "Import VPAX Data into Tabular Editor"
description: "Import Vertipaq Analyzer data from a .vpax file into Tabular Editor."
pubDate: 2021-01-18T14:30:59.973Z
updatedDate: 2021-08-18T12:09:01.118Z
categories: ["Documentation", "Automation", "Best Practices"]
heroImage: ./cover.png
---

Having read the title of this post you may be inclined to think that I am repeating a previous post. However, this new post is the simply the counterpart to my [other post](/post/vertipaqintabulareditor).

The other post was about importing [Vertipaq Analyzer](https://www.sqlbi.com/tools/vertipaq-analyzer/) data from a live-connected model into Tabular Editor. In this post, I am sharing a [new script](https://github.com/m-kovalsky/Tabular/blob/master/VpaxToTabularEditor.cs) which imports Vertipaq Analyzer data from a .vpax file to Tabular Editor. The result of executing this script is the same in comparison to the script in the previous post. However, this script does not necessitate a connection to a server as all the necessary data exists 'offline' in the .vpax file.

## What you need

- .bim file or database.json file
- Vertipaq Analyzer (.vpax) file (for the same model)

## Steps

1. Download the [script](https://github.com/m-kovalsky/Tabular/blob/master/VpaxToTabularEditor.cs).
2. Paste the script into the [Advanced Scripting](https://docs.tabulareditor.com/Advanced-Scripting.html#working-with-the-model-object) window in [Tabular Editor](https://tabulareditor.com/).
3. Modify the vpaxFile parameter at the top of the script so that it is the location of your .vpax file.
4. Click the play button (or press 'F5').

Just like that, the Vertipaq Analyzer data from the .vpax file has been loaded as annotations in Tabular Editor. And now, as with the [other script](https://github.com/m-kovalsky/Tabular/blob/master/VertipaqAnnotations.cs), you can holistically check the integrity of your model via [Best Practice Analyzer](https://docs.tabulareditor.com/Best-Practice-Analyzer.html) rules which reference these annotations. Enjoy!
