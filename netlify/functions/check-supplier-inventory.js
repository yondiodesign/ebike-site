const Airtable = require('airtable');

// This function checks supplier inventory and updates stock status
// Run this as a scheduled function (every 15-60 minutes)

exports.handler = async (event, context) => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    // Get all products with their suppliers
    const products = await base('Products')
      .select({ view: 'All Products' })
      .all();

    console.log(`Checking inventory for ${products.length} products...`);

    for (const product of products) {
      const productId = product.fields['Product ID'];
      const suppliers = product.fields['Suppliers'] || []; // Array of supplier record IDs
      
      console.log(`Checking product: ${productId}`);

      let foundInStock = false;
      let availableSupplier = null;

      // Check each supplier in order (primary first, then backups)
      for (const supplierId of suppliers) {
        try {
          const supplier = await base('Suppliers').find(supplierId);
          const supplierUrl = supplier.fields['Inventory URL'];
          const supplierName = supplier.fields['Name'];

          console.log(`  Checking supplier: ${supplierName}`);

          // Check if product is in stock at this supplier
          const inStock = await checkSupplierStock(supplierUrl);

          if (inStock) {
            foundInStock = true;
            availableSupplier = supplierName;
            console.log(`  ✅ IN STOCK at ${supplierName}`);
            break; // Found stock, no need to check other suppliers
          } else {
            console.log(`  ❌ OUT OF STOCK at ${supplierName}`);
          }
        } catch (error) {
          console.error(`  Error checking supplier:`, error.message);
          // Continue to next supplier
        }
      }

      // Update product stock status
      await base('Products').update(product.id, {
        'In Stock': foundInStock,
        'Available Supplier': availableSupplier || 'Out of Stock',
        'Last Checked': new Date().toISOString(),
      });

      console.log(`Updated ${productId}: ${foundInStock ? 'IN STOCK' : 'OUT OF STOCK'}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Checked ${products.length} products`,
      }),
    };
  } catch (error) {
    console.error('Error checking inventory:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Check if product is in stock at supplier
async function checkSupplierStock(url) {
  try {
    // Fetch the supplier page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.log(`    Failed to fetch: ${response.status}`);
      return false; // If we can't reach the page, assume out of stock
    }

    const html = await response.text();

    // Common "out of stock" indicators
    const outOfStockPatterns = [
      /out of stock/i,
      /sold out/i,
      /unavailable/i,
      /not available/i,
      /temporarily unavailable/i,
      /back in stock soon/i,
      /notify me/i,
      /email when available/i,
      /currently unavailable/i,
      /stock: 0/i,
      /quantity: 0/i,
      /inventory-status.*out/i,
    ];

    // Common "in stock" indicators
    const inStockPatterns = [
      /in stock/i,
      /add to cart/i,
      /buy now/i,
      /available now/i,
      /ships.*\d+.*days/i,
      /\d+ in stock/i,
    ];

    // Check if page has out of stock indicators
    const hasOutOfStock = outOfStockPatterns.some(pattern => pattern.test(html));
    
    // Check if page has in stock indicators
    const hasInStock = inStockPatterns.some(pattern => pattern.test(html));

    // Logic: If we find "out of stock", it's out of stock
    // If we find "in stock" and no "out of stock", it's in stock
    // If neither, assume it's in stock (to avoid false negatives)
    
    if (hasOutOfStock && !hasInStock) {
      return false; // Definitely out of stock
    }

    return true; // Probably in stock or can't determine (safe default)

  } catch (error) {
    console.error(`    Error checking stock:`, error.message);
    return false; // On error, assume out of stock
  }
}

