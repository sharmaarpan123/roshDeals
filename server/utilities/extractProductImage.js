import axios from 'axios';
import * as cheerio from 'cheerio';
const getFinalUrl = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            maxRedirects: 5, // Follow redirects
        });

        return response.request.res.responseUrl || url; // Return final URL after redirection
    } catch (error) {
        console.error(Error`following redirect for ${url}`, error.message);
        return url; // Fallback to original URL
    }
};

// Function to extract the product image
export const extractProductImage = async (url) => {
    try {
        // Get the final redirected URL
        const finalUrl = await getFinalUrl(url);

        // Fetch the product page HTML
        const { data } = await axios.get(finalUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        // Load HTML into cheerio
        const $ = cheerio.load(data);
        let imageUrl = $("meta[property='og:image']").attr('content');

        // Special handling for Amazon (if OG image is missing)
        if (!imageUrl && finalUrl.includes('amazon')) {
            imageUrl =
                $('#landingImage').attr('src') ||
                $("img[src*='images-na.ssl-images-amazon.com']").attr('src');
        }

        return imageUrl || 'Image not found';
    } catch (error) {
        console.error(Error`extracting image from ${url}`, error.message);
        return null;
    }
};

// Example usage
// (async () => {
//     const productUrls = [
//         'https://www.amazon.in/Sony-HT-S40R-Subwoofer-Connectivity-Connectitvity/dp/B0961X3R2H',
//         'https://www.flipkart.com/hrx-hrithik-roshan-running-shoes-men/p/itm7773038b71399?pid=SHOG2CHPJ3M8PUMH&lid=LSTSHOG2CHPJ3M8PUMHMARFND&marketplace=FLIPKART&sattr[]=size&st=size',
//         'https://www.myntra.com/dress/kassually/kassually-sparkle-foil-knitted-sweetheart-neck-puff-sleeves-cut-out-bling-bodycon-dress/25278940/buy?utm_campaign=social_share_pdp_deeplink&utm_medium=deeplink&utm_source=social_share_pdp',
//         'https://www.nykaa.com/lakme-9-to-5-primer-matte-perfect-cover-foundation/p/574201?productId=574201&pps=1&skuId=574186',
//         'https://www.meesho.com/classic-dream-catchers/p/eo44t',
//     ];

//     for (const url of productUrls) {
//         const image = await extractProductImage(url);
//         console.log(`Product Image for ${image}`);
//     }
// })();
