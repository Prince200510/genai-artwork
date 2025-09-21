const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateProductDescription(productData) {
    try {
      const prompt = `
        Generate a compelling product description for this traditional artwork:
        
        Title: ${productData.title}
        Category: ${productData.category}
        Artist Description: ${productData.description}
        Materials: ${productData.materials ? productData.materials.join(', ') : 'traditional materials'}
        Techniques: ${productData.techniques ? productData.techniques.join(', ') : 'traditional techniques'}
        
        Create a marketing-friendly description that highlights:
        1. The cultural significance and traditional craftsmanship
        2. The unique techniques and materials used
        3. The artistic value and story behind the piece
        4. Why collectors and art enthusiasts would value this piece
        
        Keep it engaging but professional, around 150-200 words.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Description Generation Error:', error);
      return null;
    }
  }

  async generateMarketingContent(productData, contentType = 'post') {
    try {
      let prompt = '';
      
      switch (contentType) {
        case 'post':
          prompt = `
            Create an engaging social media post for this traditional artwork:
            
            Title: ${productData.title}
            Category: ${productData.category}
            Description: ${productData.description}
            Price: $${productData.price}
            
            Make it Instagram/Facebook friendly with:
            - Engaging opening line
            - Story about the creation process
            - Relevant hashtags
            - Call to action
            
            Keep it under 300 characters with emojis.
          `;
          break;
          
        case 'blog':
          prompt = `
            Write a detailed blog article about this traditional artwork:
            
            Title: ${productData.title}
            Category: ${productData.category}
            Description: ${productData.description}
            
            Include:
            - Introduction about the art form
            - Creation process and techniques
            - Cultural significance
            - Artist's inspiration
            - Why this piece is special
            
            Write in an engaging, educational tone around 500-800 words.
          `;
          break;
          
        case 'video':
          prompt = `
            Create a video script for showcasing this traditional artwork:
            
            Title: ${productData.title}
            Category: ${productData.category}
            Description: ${productData.description}
            
            Create a 3-5 minute video script with:
            - Hook opening (0-15 seconds)
            - Process demonstration (1-3 minutes)
            - Story and technique explanation (1-2 minutes)
            - Final reveal and call to action (30 seconds)
            
            Include camera angles and visual cues.
          `;
          break;
      }

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Marketing Content Generation Error:', error);
      return null;
    }
  }

  async suggestPrice(productData, similarProducts = []) {
    try {
      const similarPricesText = similarProducts.length > 0 
        ? `Similar products sold for: ${similarProducts.map(p => `$${p.price}`).join(', ')}`
        : 'No similar products available for comparison';

      const prompt = `
        Suggest a fair market price for this traditional artwork:
        
        Title: ${productData.title}
        Category: ${productData.category}
        Description: ${productData.description}
        Dimensions: ${productData.dimensions ? `${productData.dimensions.length}x${productData.dimensions.width}x${productData.dimensions.height} ${productData.dimensions.unit}` : 'Not specified'}
        Materials: ${productData.materials ? productData.materials.join(', ') : 'traditional materials'}
        
        ${similarPricesText}
        
        Consider:
        - Traditional craftsmanship value
        - Material costs
        - Time investment
        - Artistic skill level
        - Market demand for this category
        - Uniqueness of the piece
        
        Provide a suggested price range in USD and brief justification.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Price Suggestion Error:', error);
      return null;
    }
  }

  async generateTags(productData) {
    try {
      const prompt = `
        Generate relevant tags for this traditional artwork for better discoverability:
        
        Title: ${productData.title}
        Category: ${productData.category}
        Description: ${productData.description}
        
        Generate 8-12 relevant tags including:
        - Art style/technique tags
        - Material tags
        - Cultural/regional tags
        - Aesthetic tags
        - Functional tags (if applicable)
        
        Return as comma-separated list.
      `;

      const result = await this.model.generateContent(prompt);
      const tagsText = result.response.text();
      return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    } catch (error) {
      console.error('AI Tags Generation Error:', error);
      return [];
    }
  }

  async recommendSimilarProducts(productData, allProducts) {
    try {
      const productsText = allProducts.map(p => 
        `ID: ${p._id}, Title: ${p.title}, Category: ${p.category}, Price: $${p.price}`
      ).join('\n');

      const prompt = `
        Based on this artwork:
        Title: ${productData.title}
        Category: ${productData.category}
        Description: ${productData.description}
        
        From these available products:
        ${productsText}
        
        Recommend the top 5 most similar products based on:
        - Same or related category
        - Similar style or technique
        - Comparable price range
        - Similar cultural background
        
        Return only the product IDs as comma-separated list.
      `;

      const result = await this.model.generateContent(prompt);
      const recommendedIds = result.response.text()
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      
      return recommendedIds.slice(0, 5);
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      return [];
    }
  }

  async generateArtworkSuggestions(userPreferences, availableProducts) {
    try {
      const preferencesText = `
        User Preferences:
        - Favorite Categories: ${userPreferences.categories || 'Not specified'}
        - Price Range: ${userPreferences.priceRange || 'Not specified'}
        - Previous Purchases: ${userPreferences.previousPurchases || 'None'}
        - Liked Products: ${userPreferences.likedProducts || 'None'}
      `;

      const productsText = availableProducts.slice(0, 20).map(p => 
        `ID: ${p._id}, Title: ${p.title}, Category: ${p.category}, Price: $${p.price}, Likes: ${p.likes.length}`
      ).join('\n');

      const prompt = `
        ${preferencesText}
        
        Available Products:
        ${productsText}
        
        Suggest the best 6 artworks for this user based on:
        - User's category preferences
        - Price range compatibility
        - Popularity (likes count)
        - Variety in recommendations
        - Quality and uniqueness
        
        Return product IDs as comma-separated list with brief reason for each recommendation.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Artwork Suggestions Error:', error);
      return null;
    }
  }

  async analyzeProductPerformance(productData, analytics) {
    try {
      const prompt = `
        Analyze the performance of this artwork:
        
        Product: ${productData.title}
        Category: ${productData.category}
        Price: $${productData.price}
        
        Performance Data:
        - Views: ${analytics.views || 0}
        - Likes: ${analytics.likes || 0}
        - Comments: ${analytics.comments || 0}
        - Time since posted: ${analytics.daysSincePosted || 0} days
        
        Provide insights on:
        1. Performance compared to category average
        2. Suggestions for improvement
        3. Optimal pricing recommendations
        4. Marketing strategy suggestions
        
        Keep analysis concise and actionable.
      `;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('AI Performance Analysis Error:', error);
      return null;
    }
  }
}

module.exports = new AIService();