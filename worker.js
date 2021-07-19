/* Cloudflare worker to mask Google Fonts and use Worker Cache to quickening the responses
 * ---------------------------------------------------------------------------------------
 *
 * The variables are declaired for handling google fonts cdn
 * Google fonts provide the CDN url from domain fonts.googleapis.com like this:
    https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
 * If you go to url, you will see that it returns a CSS file which has different
 * font attributes pointing to a different CDN, like this:
    @font-face {
        font-family: "Roboto";
        font-style: normal;
        font-weight: 400;
        src: url(https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2)
        format("woff2");
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
            U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
            U+FEFF, U+FFFD;
    }
  * Now we want to handle responses from fonts.gstatic.com domain as well.
  * Hence we store cssHostName to googleapis domain, and fontHostname gstatic domain.
  * We replace both of the urls with our domain and subpath. To distinguish which
  * url points to what cdn, we use fontSubPath variable.
  * That means, we will be calling the CDN through:
    https://domain.com/fonts/css2?family=Roboto:wght@400;700&display=swap
  * Almost like google fonts, but with your domain
  * This implementation can be modified to handle other CDN
 * */
const domain = "domain.com"; // your domain
const subPath = "/fonts"; // your domain subpath ie, https://domain.com/fonts
const cssHostname = "fonts.googleapis.com"; // specific to google fonts
const fontHostname = "fonts.gstatic.com"; // specific to google fonts
const fontSubPath = "/s/"; // specific to google fonts

async function handleRequest(event) {
  const request = event.request;
  const url = new URL(request.url); // making an url object from the request
  const cacheKey = new Request(url.toString(), request); // generating the cache key
  const cache = caches.default;
  let response = await cache.match(cacheKey); // checking if there is any response

  if (!response) {
    // not found in cache, now calling the CDN
    if (url.pathname.includes(fontSubPath)) {
      // assuming its the font (ie woff2 file)
      response = await processFontResponse(url, request, response);
    } else {
      // assuming it is the css file
      response = await processCssResponse(url, request, response);
    }
    // storing the information in cache
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }
  return response;
}

addEventListener("fetch", (event) => {
  // intercepting the request. Process starts from here
  return event.respondWith(handleRequest(event));
});

async function processCssResponse(url, request, response) {
  url.hostname = cssHostname; // replacing the hostname (your domain) with actual hostname (ie googleapis)
  url.pathname = url.pathname.replace(subPath, ""); // removing the subPath information from your actual path
  response = await fetch(url.toString(), request);
  const originalBody = await response.text();
  // modifying the response body. Replacing the CDN hostname with your domain
  const modified = originalBody.replaceAll(fontHostname, domain + subPath);
  // creating new response
  response = new Response(modified, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  return response;
}

async function processFontResponse(url, request, response) {
  url.hostname = fontHostname; // replacing the your domain with actual CDN (ie gstatic)
  url.pathname = url.pathname.replace(subPath, ""); // removing subpath information from actual path
  response = await fetch(url.toString(), request);
  return response; // returning the response (woff/woff2 file)
}
