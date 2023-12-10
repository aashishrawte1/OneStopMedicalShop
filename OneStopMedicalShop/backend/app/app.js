// app.js
const express = require('express');
// const { v1: neo4j } = require('neo4j-driver');
const neo4j = require('neo4j-driver');
const Shopify = require('shopify-api-node');
require('dotenv').config();

const app = express();
const port = 3000;

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt+s://acbb0fad.databases.neo4j.io:7687',
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
  {
    maxConnectionLifetime: 60 * 60 * 1000,
    maxConnectionPoolSize: 300,
  }
);

const session = driver.session();

// Function to import data from JSON
async function importData(jsonFilePath) {
  const result = await session.writeTransaction(async (transaction) => {
    const cypherQuery = `
      LOAD JSON FROM "file://${jsonFilePath}" AS data
      UNWIND data.products AS product
      MERGE (p:Product {productId: product.productId})
      SET p.name = product.name, p.price = product.price
      WITH p, product.attributes AS attributes
      UNWIND attributes AS attribute
      MERGE (a:Attribute {name: attribute.name})
      MERGE (p)-[:HAS_ATTRIBUTE]->(a)
    `;

    return transaction.run(cypherQuery);
  });

  console.log(`Data imported from ${jsonFilePath}.`);
  transaction.commit();
  return result;
}

// Import data from both JSON files
Promise.all([
  importData('/Users/aashishrawte/Documents/Personal-Work/one-stop-medical-shop-main/datasets/products_sample_01.json'),
  importData('/Users/aashishrawte/Documents/Personal-Work/one-stop-medical-shop-main/datasets/products_sample_02.json')
])
  .then(() => {
    // Query relations
    const query = `
      MATCH (p1:Product)-[:HAS_ATTRIBUTE]->(a:Attribute)<-[:HAS_ATTRIBUTE]-(p2:Product)
      WHERE id(p1) < id(p2)
      RETURN p1, p2, COLLECT(DISTINCT a) AS commonAttributes
    `;

    return session.readTransaction((transaction) => transaction.run(query))
      .then((result) => {
        console.log(result.records.map(record => record.toObject()));
      });
  })
  .catch(error => console.error(error))
  .finally(() => {
    // Close the session and driver when done
    session.close();
    // driver.close();
  });

// Shopify configuration
const shopify = new Shopify({
    shopName: process.env.SHOPIFY_SHOP_NAME,
    // apiKey: process.env.SHOPIFY_API_KEY,
    // password: process.env.SHOPIFY_API_SECRET,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
    apiVersion: '2021-10',
});

module.exports = shopify;

// async function getProducts() {
//   try {
//     const products = await shopify.product.list();
//     console.log("products1 =>", products);
//   } catch (error) {
//     console.error(error);
//   }
// }

// getProducts();

// prtapi_4fce69b648c499de61d1594e4f97194b

app.get('/products', async (req, res) => {
  try {
    const session = driver.session();
    // MATCH (product) RETURN product
    const result = await session.run('MATCH (product) RETURN product');
    const products = result.records.map((record) => record.get('product').properties);
    // console.log("products => ", products);

    // Format products as per Shopify requirements
    // start of shopify block //
    const shopifyProducts = products.map((product) => {
      const shopifyProduct = {
        title: product.prod_title,
        body_html: product.meta_description,
        // vendor: product.specifications.Manufacturer,
        // details: product['product-features'].join('\n'),
      };
    
      if (product.schema && product.schema.image) {
        shopifyProduct.images = [
          {
            src: product.schema.image,
          },
        ];
      }
    
      // const specificationsMetafields = Object.entries(product.specifications).map(([key, value]) => ({
      //   key,
      //   value,
      //   value_type: 'string',
      //   namespace: 'specifications',
      // }));
    
      // shopifyProduct.metafields = specificationsMetafields;
    
      if (product.tags && product.tags.length > 0) {
        shopifyProduct.tags = product.tags;
      }
    
      return shopifyProduct;
    });
    
    // Now shopifyProducts is an array of Shopify product objects.
    

    // end of shopify block //


    // const shopifyProducts = products.map((product) => {
    //   const shopifyProduct = {
    //     _id: product._id, // assuming _id is available in the original data
    //     product: {
    //       productId: product.product.productId,
    //       details: {
    //         longDescription: product.product.details.longDescription,
    //         displayName: product.product.details.displayName,
    //         url: product.product.details.url,
    //         manufacturer: product.product.details.manufacturer,
    //       },
    //     },
    //     material: product.material,
    //     details: {
    //       isLatexFree: product.details.isLatexFree,
    //       mfrProdNum: product.details.mfrProdNum,
    //       salesUOM: product.details.salesUOM,
    //       displayName: product.details.displayName,
    //       packagingStringLong: product.details.packagingStringLong,
    //       url: product.details.url,
    //       baseUOM: product.details.baseUOM,
    //       deliveryUOM: product.details.deliveryUOM,
    //       manufacturer: product.details.manufacturer,
    //       packagingStringShort: product.details.packagingStringShort,
    //     },
    //     media: [
    //       {
    //         type: "imagePrimary",
    //         url: product.media[0].url, // assuming at least one image is available
    //       },
    //     ],
    //     specifications: [
    //       {
    //         name: "Latex Free",
    //         value: [product.details.isLatexFree ? "Yes" : "No"],
    //       },
    //       {
    //         name: "UNSPSC",
    //         value: [product.specifications[1].value[0]], // assuming UNSPSC is available
    //       },
    //     ],
    //     packagingDetails: product.packagingDetails.map((packagingDetail) => ({
    //       baseUomDesc: packagingDetail.baseUomDesc,
    //       uomDesc: packagingDetail.uomDesc,
    //       length: packagingDetail.length,
    //       casePack: packagingDetail.casePack,
    //       volume: packagingDetail.volume,
    //       grossWeight: packagingDetail.grossWeight,
    //       netWeight: packagingDetail.netWeight,
    //       uom: packagingDetail.uom,
    //       salesUom: packagingDetail.salesUom,
    //       width: packagingDetail.width,
    //       gtinAndUpc: packagingDetail.gtinAndUpc,
    //       weightUom: packagingDetail.weightUom,
    //       volumeUom: packagingDetail.volumeUom,
    //       conversion: packagingDetail.conversion,
    //       height: packagingDetail.height,
    //     })),
    //   };
    
    //   return shopifyProduct;
    // });
    
    // shopifyProducts;
    

    // Create or update products on Shopify
    const updatedProducts = await shopify.product.list();
    const existingProductIds = updatedProducts.map((product) => product._id);
    // console.log('shopifyProducts =>', shopifyProducts);
    for (const shopifyProduct of shopifyProducts) {
      const existingProduct = updatedProducts.find(
        (product) => product.title === shopifyProduct.title
      );

      if (existingProduct) {
        // Update existing product on Shopify
        await shopify.product.update(existingProduct.id, shopifyProduct);
      } else {
        // Create new product on Shopify
        // console.log('executing');
        await shopify.product.create(shopifyProduct);
      }
    }

    res.status(200).json({ message: 'Products synchronized successfully', data: products });
  } catch (error) {
    console.error('Error fetching data from Neo4j or updating Shopify:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
});

// Shopify webhook endpoint
app.post('/webhooks/shopify', async (req, res) => {
    // Handle Shopify webhook payload
    const data = req.body;
  
    // Perform actions based on the Shopify webhook data
    // ...
  
    res.status(200).send('Webhook received successfully');
});


// OAuth callback endpoint
app.get('/auth/callback', async (req, res) => {
    const { shop, code } = req.query;
  
    try {
      // Get access token using the code
      const accessToken = await shopify.getAccessToken({ shop, code });
  
      // Save the access token to your database or use it as needed
      // ...
      console.log('Access token', accessToken);
  
      res.status(200).send('Authentication successful');
    } catch (error) {
      console.error('Error during OAuth process:', error);
      res.status(500).send('Error during OAuth process');
    }
});

app.get('/', async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run('MATCH (n) RETURN count(n) as count');
    res.json({ nodeCount: result.records[0].get('count').toInt() });
  } finally {
    await session.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
