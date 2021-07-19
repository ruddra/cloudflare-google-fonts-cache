# Cloudflare Worker for Google Fonts Masking and Caching

This worker can be used to mask google font CDN with your own domain, so that you don't have to call or preconnect to google fonts from your html. Also, we are using worker cache to store the responses, so that we can make the calls faster.

## How it works
Basically if you point your domain ie `https://domain.com/fonts/*` to this worker, then you should be able to get responses just like google CDN. For example:
`https://domain.com/fonts/css2?family=Roboto:wght@400;700&display=swap` is same as `https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap`. Simillarly `https://domain.com/fonts/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2` actual font file ie woff2 file) is same as `https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2`.

## Contribute
Feel free to create a PR for any improvements.

## License
MIT
