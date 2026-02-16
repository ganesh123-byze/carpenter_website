# Show Google Reviews on your site — serverless example

Overview
- This guide provides a small serverless function (Node.js) that calls the Google Places Details API (server-side) and returns reviews to your website. Keep your API key secret by calling Google from the serverless function.

Steps summary
1. Create a Google Cloud project and enable the **Places API** (Places Details). Attach billing (Google gives a free tier credit).
2. Create an API key (restrict it to your deployed function's origin or to Places API only).
3. Find your Place ID (instructions below).
4. Deploy the serverless function (Vercel, Netlify Functions, or Google Cloud Functions) — set environment variables `GOOGLE_API_KEY` and `PLACE_ID`.
5. Add the client-side fetch to display reviews on your site.

Find your Place ID
- Use Google Place ID Finder: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
- Search your business name (Visakhapatnam) and copy the Place ID.

Serverless function (Node.js, Vercel/Netlify style)
```js
// File: reviews-server.js (example)
const fetch = require('node-fetch');
const express = require('express');
const app = express();

const API_KEY = process.env.GOOGLE_API_KEY; // required
const PLACE_ID = process.env.PLACE_ID; // required

app.get('/reviews', async (req, res) => {
  if(!API_KEY || !PLACE_ID) return res.status(500).json({ error: 'Missing API key or PLACE_ID' });
  try{
    const fields = 'name,rating,reviews,formatted_address';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=${fields}&key=${API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    if(data.status !== 'OK') return res.status(500).json({ error: data.status, details: data.error_message });
    // Return only safe parts (don't leak API key)
    const out = {
      name: data.result.name,
      rating: data.result.rating,
      address: data.result.formatted_address,
      reviews: (data.result.reviews || []).map(r => ({author_name: r.author_name, rating: r.rating, text: r.text, time: r.relative_time_description}))
    };
    res.json(out);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log('reviews server listening on', port));
```

Notes for deployment
- Vercel: create an API file at `api/reviews.js` exporting the handler. Set `GOOGLE_API_KEY` and `PLACE_ID` in Vercel Environment Variables.
- Netlify: create a function in `netlify/functions/reviews.js`. Set environment variables in Netlify UI.
- Google Cloud Functions: deploy as an HTTP function; set env vars in cloud run or use Secret Manager.

Client-side example (add to `script.js` or a new file)
```js
async function fetchAndRenderReviews(){
  try{
    const resp = await fetch('/api/reviews'); // adjust path to your deployment (e.g., '/.netlify/functions/reviews' or '/api/reviews')
    const data = await resp.json();
    // render data.reviews into your reviews list
    const container = document.querySelector('.reviews-list');
    if(!container) return;
    container.innerHTML = '';
    (data.reviews || []).forEach(r=>{
      const block = document.createElement('blockquote');
      block.className = 'review';
      block.innerHTML = `<p>"${r.text}"</p><footer>— ${r.author_name} — ${r.rating}★</footer>`;
      container.appendChild(block);
    });
  }catch(err){ console.error('Could not load reviews', err); }
}

fetchAndRenderReviews();
```

Security and quotas
- Do not call Google Places from client-side JavaScript — the API key would be exposed.
- Restrict your API key to Places API and to the deployed function origin.
- Google Places returns a limited number of recent reviews (usually up to 5).

If you want, I can:
- Add the serverless function template to this repo (Vercel/Netlify format).
- Generate the client-side integration and modify `index.html`/`script.js` to render reviews after you deploy the function and provide the deployed endpoint and API key steps.
