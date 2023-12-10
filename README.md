# One stop medical shop

We want to build a one stop eCommerce shop for providing medical equipments and products. For this we have identified the Magento(you can use any frame work of your choice) as our eCommerce platfrom and also gathered data on the medical equipments and products. We now want to see our Magento eCommerce shop populated with the gathered data.

## Test Description

We will be providing you with instructions on the working tech stack, datasets, expected outcome and results.

### Tech stack

- Any e commerce framework of your choice(like Magento, woo commerce, shopify plus e.t.c)
- Backend of your choice
- Docker/ Docker Compose
- Neo4j

### Datasets

We are providing with sample products from two data sources. The dataset contains information on products and could also contain some common products in both files.

- [products_sample_01.json](./datasets/products_sample_01.json)
- [products_sample_02.json](./datasets/products_sample_02.json)

You are expected understand the requirements of the final output and based on the analsis, transform, and aggregate the data into acceptable processed data suitable for importing products in Magento eCommerce shop.

### Neo4j graph database

The dataset we are using is highly connected data and we would be using Neo4j to intermediately store, process and aggregate the data items from the dataset files.

You are expected to use [products_sample_01.json](./datasets/products_sample_01.json) and [products_sample_02.json](./datasets/products_sample_02.json) and import the data in Neo4j and show relations among the common product groups and relations between the attributes and the product items. Following are the sample nodes generated from products of [products_sample_01.json](./datasets/products_sample_01.json).

**Overview of Product, Brand, Manufacturer in neo4j nodes from sample 01**
![](/assets/neo4j-overview.png)

**Relationship among Product, Brand, Manufacturer in neo4j nodes from sample 01**
![](/assets/neo4j-relations.png)


### Expected outcome in Magento eCommerce shop

As mentioned above we want to build one stop eCommerce shop for providing medical equipments and products, hence as a requirement we want to see the working demo of a Magento eCommerce store with the catalogoue of products from the provided datasets.

You are expected to create a docker compose file for the deployments of services and databases.

**Product attributes highlighted in the box from the datasets**
![](/assets/product-attributes.png)

**Product features highlighted in the box from the datasets**
![](/assets/product-features.png)

**Product specifications highlighted in the box from the datasets**
![](/assets/product-specifications.png)

## Submission Checklist

Once you have completed the test successfully you are expected to provide following:

- Git repository and working code (live demo link/ steps to run service)
  - Deployments should be done using docker/ docker compose for all the services, servers and databases
  - You can fork this repository and share the Merge Request for submission
- Neo4j data visualizations, screenshots, recording or a demo link
  - relations among the common product groups
  - relations between the attributes and the product items
- Share README.md, DEPLOYMENT.md, etc
  - Mention of documentation/ references/ tutorials followed
  - Clearly documenting steps to deploy and use the service
- Add in detail about one key takeaway or a new skill you picked from this exercise, providing references to articles, tutorials, examples, etc.
# OneStopMedicalShop
