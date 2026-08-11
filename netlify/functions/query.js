// This function runs on Netlify's servers, not in the visitor's browser.
// It fetches data from Montana's Cadastral service and hands it back to
// our page from OUR OWN domain — so the browser never makes a cross-origin
// request and CORS never comes into play.

const BASE_URL = "https://gis.dnrc.mt.gov/arcgis/rest/services/DNRALL/Cadastral/MapServer/0/query";

exports.handler = async function (event) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const incoming = event.queryStringParameters || {};
    const params = new URLSearchParams(incoming);
    params.set("f", "json");

    const upstreamUrl = `${BASE_URL}?${params.toString()}`;

    const resp = await fetch(upstreamUrl);
    const text = await resp.text();

    if (!resp.ok) {
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({
          error: { message: `State server returned status ${resp.status}` },
        }),
      };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: corsHeaders,
      body: JSON.stringify({
        error: { message: `Function could not reach the state server: ${err.message}` },
      }),
    };
  }
};
