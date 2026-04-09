# Meeting notes

## Apr 9th
We've been testing a simple web app version of the radio using only keywords to create a "channel". We have 4 channels that play continuously and one custom built channel (flo 107.5)

- Need a way to "stop" the radio (at the moment the only option is to either close the browser or turn down the volume)
- Removed religious shows
- Unable to properly filter out non-English shows, had a german show pop up
- AI generated podcasts are showing up, again coming back to HMW improve the quality of what we're serving?
- Greg needs to do math on when the show will end in terms of time of day (e.g. Radio hosts set expectations re: timing, "we'll be back in a few minutes")
- Lack of shorter segments makes the show feel extra long (whereas in radio, a show is broken up by ads or hourly news updates)
  - AI radio host? To help break up long segments and set expectations?
  - Max threshold, nothing over an 1hr?
- Volume levels varied
- Are we working on serving content better (relevancy through queried stations) and/or Making content creation easier (customization through station creation)?
  - One approach: lean in on the passive listening experience, serving better content, but add a few curated stations mixed in there. Let's see which ones people tune into the most.
- Was nice to not have to make micro-decisions when flo needed a calm sound
  - Personalization? Recommendations? Serve shows based on your habits.

## Nov 21

### re: Research doc
- Our product isn't a replacement (e.g. Lightphone for phone) but a compliment to existing behaviors
- Venn diagram of our persona: 
  - Open to new experiences
  - Podcast enthusiast
  - Appreciates non-phone experiences (e.g. Kindle)

### re: Claude suggestions
- Temporal: Contextually driven by your current environment (e.g. weather, events)
  - "Dynamic" stations
- How do we classify a podcast's 'vibe or need'?
  - Maybe through a transcript, the words they use
  - "Taddy" API has transcripts