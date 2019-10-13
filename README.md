A different type of election map for Romania

I created an interactive map of elections for Romania based on administrative unit level and in this post I'll take you through the whole cartographic process of creating this map.

When I work on a map I have the following workflow:

I start by thinking about the story and this part defines the whole cartographic process. The message that I want to send and the audience I want to send it to will drive the project, starting with the design all the way to choosing the technology and implementing the map. In this phase I also do a small data search to see if there actually is any data that would help me tell my story. Then I start planning the story carefully and sketching designs of what the visualization and the user interaction would be.

Next step involves data preparation and publishing for the web. This step sounds straight-forward but can be very time consuming, because most of the times the data isn't in the format that we need it.

With the data in my pocket I start iterating over different designs and going back and forth between implementation and design. Important to know is that actually during the whole project I'll be going back and forth between story, data and visualization. Sometimes it happens that once you get and analyse the data, the story takes a new turn or maybe because of technical limitations some things can't be implemented the way you planned in the design phase.

At the end I like to share the map with friends or work colleagues and ask them what they understand from the map. If they understand the message, the project achieved its goal.

In this blog post I'll tell the story of the Romanian elections for the European Parliament. If you look in the online soial media, you'll notice that there are not many interactive maps and the maps that do exist are at county level. Here are some examples:

// to do: add images

Romanian county level maps show a general overview of the winners, but I was interested in a more detailed map that would show patterns in how Romanians voted. Are there differences between rural and urban areas? Are there maybe smaller regions within a county where the majority of people voted for a different party? How strong were the parties that won, did they win with a large majority of votes? These are questions that I'd like to answer with my map.

The users are the romanian citizens who have access to internet, who are interested in the election results. I assume most of the people will access this map on their mobile phones, so the map needs to be responsive.

So starting with this idea, I went on to search for data. I was very happy to find geometries for administrative units (these are the equivalent of NUTS 3 regions for Romania) on [geo-spatial.org](http://www.geo-spatial.org/download/romania-seturi-vectoriale). This website belongs to a Romanian organization focused on open source geospatial technologies. BEC, the organization responsible for the voting process during elections has [election data available for download](https://prezenta.bec.ro/europarlamentare26052019/romania-pv-final) for each election office within the country. [Here](https://prezenta.bec.ro/europarlamentare26052019/abroad-pv-final) I also downloaded the results for the Romanians who voted from abroad.

So after finding this data I started thinking about the story and the way I want to present these detailed results. At this point I started exploring the data in ArcGIS Pro. Most common for election maps are choropleth maps. So I initially created a much more detailed choropleth map:

// to do: add image of the map

Choropleth maps have the downside that the area influences very much our perception of the results. I wanted a map that would show the predominant party, but it would also give a hint of how many people actually voted for that predominant party. 100 small administrative units that voted for PSD will gather way less votes that the capital city that voted for USR Plus, but on the map those 100 administrative units cover a larger area, making them look more important. So I decided to replace the areas with points and create a proportional symbols map. This changes our impression quite drastically:

// to do: add image of the map

Basically the map design is driven by the following ideas:

- See if there are any differences between rural and urban areas. Showing the number of votes helps distinguish between rural and urban areas (urban areas will always have more voters than rural areas).

- How big the region is geographically should not influence the perception on the importance of the party. The visualization should be driven by the number of votes and not by how big that region is geographically. To give more importance to the regions with more votes, we will represent the regions using points and the size of the circles will be proportional to the number of votes.

- The user should be able to see if a party won a certain region by a very large majority (more than 80%) or if it was actually a tight result (less than 40%). The strength of a party can be shown on the map using opacity. The more opaque the party, the bigger the percentage of voters in that region.

- Lastly, the user should be able to filter between different parties and see in which administrative units each party won.

At this point I created many sketches to have a physical representation of the UI and to help think about the user interaction:

// to do: add sketches of UI's and map designs

Having all this sorted out, I moved on to the data processing part, which honestly took most of my time. First of all, I converted the administrative unit areas to points. I did that by using FeatureToPoint tool in ArcGIS Pro. This calculates the centroids of the polygons and I also made sure to have the centroid fall inside the polygon.

Next I needed to merge the 2 datasets, the election results and the centroids. I did this using the pandas library, so I converted both my datasets to csv. This is very convenient also because once I merge them I can add them as a source for a CSVLayer to my map.

For the administrative units centroid I converted the coordinates to Latitude Longitude and saved them as new fields in the attribute table. Next I exported the attribute table to CSV using Export to Table in ArcGIS Pro.

Both election results and the administrative units had 2 fields for the name of the administrative unit and the name of the county. I used these 2 fields to join the 2 tables. Here I ran into issues with administrative units that had different names in the 2 tables, or they had special characters that didn't use the same encoding. I solved this problem by replacing the special characters with normal ones (for example a became a and all the spaces and minus signs were deleted).

After merging the 2 datasets I calculated 3 new fields: predominant party (pred_party), percentage of the predominant party (pred_percentage), absolute votes of the predominant party (pred_absolute). These fields will drive the map visualization and will also be used for the filtering.

Visualization

For the basemap I wanted to use a very light basemap that only shows the borders of the neighboring countries and the Black Sea. This gives enough context to identify that the country is Romania. It's a grayscale basemap because we already have many colors for the different parties and adding colors for the background would not work well with the opacity on the administrative units. It was also important to have the relief showing the mountain areas, because it's interesting to see how these create natural borders in the political landscape.

I created the basemap using the following datasets:

 - Esri world terrain hillshade raster tile layer
 - Esri basemap vector tile layer where I only visualize the borders and the oceans/seas.
 - Labels for biggest cities loaded as a CSVLayer
 - Borders for counties and administrative units for different scales as raster tile layers


Interpreting the map:


This is now a total different view of the election results. We can clearly distinguish the bigger cities (big circles) and see that the majority voted for USR Plus. This is a new alliance between 2 parties and most of the people in the cities had voted for them. In the rural areas people are more conservative and voted for the older parties: PSD and PNL. In the center and north-west part of the country you can see the green votes for the hungarian party. Most of the people here belong to the hungarian minority in Romania and voted for the hungarian party. Another thing you can notice from this map is how the mountains set some sort of natural border between the different regions of Romania. In the south many people vote for PSD, the red party while above the mountain chain the preferred party is PNL. A reason for this is that the current Romanian president was also the previous president of PNL. Before being elected the country's president he was the mayor of Sibiu for many years and during that time Sibiu greatly profited. The people in that area still vote for PNL. These are some of the insights that we can read from this map.

