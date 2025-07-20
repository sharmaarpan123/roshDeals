import axios from 'axios';
import * as cheerio from 'cheerio';
import { z } from 'zod';
import catchAsync from '../../utilities/catchAsync.js';
import { successResponse, errorResponse } from '../../utilities/Responses.js';

// Validation schema for seller ID
const sellerIdSchema = z.object({
    sellerId: z.string({
        required_error: 'Seller ID is required',
        invalid_type_error: 'Seller ID must be a string'
    }).trim().min(1, { message: 'Seller ID cannot be empty' })
});

/**
 * Scrape Amazon seller data by seller ID
 * @route GET /user/seller/:sellerId
 * @access Private (requires USER role)
 */
export const scrapeSellerData = catchAsync(async (req, res) => {
    // Validate seller ID
    const validationResult = sellerIdSchema.safeParse(req.params);
    if (!validationResult.success) {
        return errorResponse({
            message: validationResult.error.errors[0].message,
            statusCode: 400,
        });
    }

    const { sellerId } = validationResult.data;

    const url = `https://www.amazon.in/sp?seller=${sellerId}`;

    // Headers to mimic a browser request
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    };

    try {
        // Fetch the seller page
        const response = await axios.get(url, { 
            headers, 
            timeout: 10000,
            validateStatus: (status) => status < 500 // Accept all status codes less than 500
        });
        
        if (response.status === 200) {
            // Parse HTML content
            const $ = cheerio.load(response.data);
            
            // Initialize data object
            const sellerData = {
                seller_id: sellerId,
                seller_name: 'N/A',
                rating: 'N/A',
                number_of_ratings: 'N/A',
                star_distribution: {}
            };

            // Extract seller name - try multiple selectors
            let sellerName = $('h1#seller-name').text().trim();
            if (!sellerName) {
                sellerName = $('h1#sellerName').text().trim();
            }
            if (!sellerName) {
                // Look for seller name in the verified customer text
                const verifiedText = $('.a-text-bold').filter(function() {
                    return $(this).text().includes('Feedback provided by verified customers of');
                }).text().trim();
                if (verifiedText) {
                    const match = verifiedText.match(/Feedback provided by verified customers of (.+)/);
                    if (match) sellerName = match[1];
                }
            }
            
            // If still no seller name, try to extract from the page title or other elements
            if (!sellerName) {
                const pageTitle = $('title').text().trim();
                if (pageTitle) {
                    const titleMatch = pageTitle.match(/Seller Profile: (.+)/);
                    if (titleMatch) sellerName = titleMatch[1];
                }
            }
            if (sellerName) sellerData.seller_name = sellerName;

            // Extract rating from the current time period (default is 12 months)
            const currentRatingElement = $('#effective-timeperiod-rating-year-description');
            if (currentRatingElement.length) {
                sellerData.rating = currentRatingElement.text().trim();
            } else {
                // Fallback to any rating element
                const ratingText = $('span.ratings-reviews').first().text().trim();
                if (ratingText) sellerData.rating = ratingText;
            }

            // Extract number of ratings from the default feedback count section
            const totalRatingsElement = $('#ratings-reviews-count');
            if (totalRatingsElement.length) {
                sellerData.number_of_ratings = totalRatingsElement.text().trim();
            } else {
                // Fallback to any ratings count element
                const ratingsCountElement = $('.ratings-reviews-count').first();
                if (ratingsCountElement.length) {
                    sellerData.number_of_ratings = ratingsCountElement.text().trim();
                }
            }

            // Extract star rating distribution from histogram using specific IDs
            const starIds = ['percentOneStar', 'percentTwoStar', 'percentThreeStar', 'percentFourStar', 'percentFiveStar'];
            
            starIds.forEach((id, index) => {
                const percentage = $(`#${id}`).text().trim();
                if (percentage) {
                    const starNumber = index + 1;
                    sellerData.star_distribution[`${starNumber}_star`] = percentage;
                }
            });

            // Check if we got any meaningful data
            const hasData = sellerData.seller_name !== 'N/A' || 
                           sellerData.rating !== 'N/A' || 
                           sellerData.number_of_ratings !== 'N/A' ||
                           Object.keys(sellerData.star_distribution).length > 0;

            if (!hasData) {
                return errorResponse({
                    message: 'Seller data not found or seller page is not accessible',
                    statusCode: 404,
                });
            }

            return successResponse({
                message: 'Seller data retrieved successfully',
                data: sellerData,
            });
        } else {
            return errorResponse({
                message: `Failed to retrieve page: Status code ${response.status}`,
                statusCode: response.status,
            });
        }
    } catch (error) {
        console.error(`Error fetching seller page: ${error.message}`);
        
        if (error.code === 'ECONNABORTED') {
            return errorResponse({
                message: 'Request timeout - Amazon server took too long to respond',
                statusCode: 408,
            });
        }
        
        if (error.response) {
            return errorResponse({
                message: `Amazon server error: ${error.response.status}`,
                statusCode: error.response.status,
            });
        }
        
        return errorResponse({
            message: `Error fetching seller data: ${error.message}`,
            statusCode: 500,
        });
    }
});