import axios from 'axios';
import * as cheerio from 'cheerio';

// Configure axios instance with optimized settings
const axiosInstance = axios.create({
    timeout: 20000,
    maxRedirects: 5,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    },
    validateStatus: status => status >= 200 && status < 400
});

const getFinalUrl = async (url) => {
    // Validate URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('Invalid or empty URL provided');
    }

    try {
        const response = await axiosInstance.get(url);
        return response.request.res.responseUrl || url;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error(`Request timeout while following redirect for ${url}`);
        }
        throw new Error(`Error following redirect for ${url}: ${error.message}`);
    }
};

// Function to extract the product image
export const extractProductImage = async (url) => {
    // Validate URL
    if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('Invalid or empty URL provided');
    }

    try {
        // Get the final redirected URL and fetch HTML in parallel
        const [finalUrl, { data }] = await Promise.all([
            getFinalUrl(url),
            axiosInstance.get(url)
        ]);

        // Load HTML into cheerio with optimized settings
        const $ = cheerio.load(data, {
            decodeEntities: false,
            normalizeWhitespace: true
        });

        // Try to find image URL using optimized selectors
        const imageUrl = 
            $("meta[property='og:image']").attr('content') ||
            $("meta[name='twitter:image']").attr('content') ||
            (finalUrl.includes('amazon') && (
                $('#landingImage').attr('src') ||
                $("img[src*='images-na.ssl-images-amazon.com']").attr('src')
            )) ||
            $('img[src*="product"]').first().attr('src') ||
            $('img[src*="item"]').first().attr('src');

        if (!imageUrl) {
            throw new Error('No product image found on the page');
        }

        return imageUrl || '';
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error(`Request timeout while extracting image from ${url}`);
        }
        throw new Error(`Error extracting image from ${url}: ${error.message}`);
    }
};
