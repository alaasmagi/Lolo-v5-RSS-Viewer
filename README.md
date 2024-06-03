# Lolo-v5

## Task: 
      Create a website called "Lolo v5" that fetches its initial content from:
      https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss
      • The user can add/edit/remove custom RSS feeds, which should remain even after refreshing the page.
      • There should be a way to filter articles based on their categories.
      • All articles should be ordered by date (newest first).
      • Articles from different feeds should be easily distinguishable.
      • Every article can be opened by clicking on the articles title, description, or image.
      • Before displaying the article, it must be freed from clutter using the Mercury API web parser.
      Simple POST request to https://uptime-mercury-api.azurewebsites.net/webparser will return desired
      result.
      Example POST request body (application/json) ->
      {
      "url":"https://www.theverge.com/tech"
      }
      • Clutter-free article content should be displayed inside of a scalable modal.
      • No other external APIs or web services can be used.
      • Fully responsive CSS should be written by the developer and not by referencing wellknown front-end
      component libraries like "Bootstrap" or similar.
      • Host the finished site on Render (https://render.com/) or Vercel (https://vercel.com/) and the code in a
      repository of your choosing.

## Notes:
      As this is one of the first times trying my hand at JavaScript, displaying individual articles in the modal 
      didn't work out very well. The part of the modal that didn't work out was commented out in the CSS and JavaScript files.
