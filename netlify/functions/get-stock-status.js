const Airtable = require('airtable');

// Get real-time stock status for products
// Frontend calls this to check if products are in stock

exports.handler = async (event, context) => {
  // Allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const { productId } = event.queryStringParameters || {};

    // If specific product requested
    if (productId) {
      const products = await base('Products')
        .select({
          filterByFormula: `{Product ID} = '${productId}'`,
          maxRecords: 1,
        })
        .firstPage();

      if (products.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Product not found' }),
        };
      }

      const product = products[0].fields;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          productId: product['Product ID'],
          inStock: product['In Stock'] !== false, // Default to true if not set
          availableSupplier: product['Available Supplier'] || 'Unknown',
          lastChecked: product['Last Checked'],
          price: product['Price'],
          name: product['Name'],
        }),
      };
    }

    // Otherwise, return all products
    const products = await base('Products')
      .select({ view: 'All Products' })
      .all();

    const stockStatus = products.map(record => ({
      productId: record.fields['Product ID'],
      name: record.fields['Name'],
      inStock: record.fields['In Stock'] !== false,
      availableSupplier: record.fields['Available Supplier'] || 'Unknown',
      lastChecked: record.fields['Last Checked'],
      price: record.fields['Price'],
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ products: stockStatus }),
    };

  } catch (error) {
    console.error('Error getting stock status:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

