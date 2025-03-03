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
            timeout: 5000,
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
            timeout: 5000,
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
