// This function runs on Netlify's servers, not in the visitor's browser.
// It fetches data from Montana's statewide Cadastral Framework service
// (maintained by the Dept. of Revenue and Montana State Library) and hands
// it back to our page from OUR OWN domain — so the browser never makes a
// cross-origin request and CORS never comes into play.
//
// NOTE: this was switched from the old gis.dnrc.mt.gov/DNRALL/Cadastral
// service to msdi_cadastral_map_v1 (layer 1, "Montana Parcels") because the
// old service had much thinner address coverage for in-town/incorporated
// city parcels (confirmed missing many Bozeman addresses, for example).

const BASE_URL = "https://gisservice.mt.gov/arcgis/rest/services/msdi_cadastral_map_v1/MapServer/1/query";

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
