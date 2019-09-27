const fetch = require("node-fetch");

const config = {
  accept: 'application/json, text/plain, */*',
  method: 'GET',
  authorization: false,
  token: null,
  debug: false,
  withPage: false,
  page: 1
};

const openAndRequest = async (url, options, jsonData = false) => {
  const newconfig = { ...config, ...options };
  const _url = url + (newconfig.withPage ?
    (url.indexOf('?') > 0 ? '&' : '?') + 'page=' + newconfig.page : '');
  if (newconfig.debug) {
    console.log('URL:', _url);
  }
  const headers = buildHeaders(jsonData, options);
  let data = {};
  try {
    const response = await fetch(_url, {
      method: newconfig.method,
      body: jsonData ? jsonData : null,
      headers
    });
    data = await response.json();
  } catch (error) {
    data.error = error;
  }
  return data
}

const buildHeaders = (jsonData, options) => {
  const contentType = jsonData ? { 'Content-Type': 'application/json' } : undefined;
  const authorization = options.authorization ? { 'Authorization': options.token } : undefined;
  const accept = options.accept ? { 'Accept': options.accept } : undefined;
  return { ...contentType, ...authorization, ...accept };
}

module.exports = {
  openAndRequest: openAndRequest
}