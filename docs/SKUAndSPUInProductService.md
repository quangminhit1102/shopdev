```mermaid
graph LR
    User[User] --> Core[Core]

    Core --> InventoriesService[Inventories<br/>Service]
    Core --> CartService[Cart Service]
    Core --> ProductService[Product Service]
    Core --> UserService[User Service]
    Core --> FlashSaleService[Flash Sale<br/>Service]
    Core --> ShopService[Shop Service]
    Core --> OrderService[Order Service]
    Core --> EllipsisService[... Service]
    Core --> AnotherService[Another Service]

    ProductService --> Media["Media (img/video)"]
    ProductService --> SKU["SKU (Stock Keeping Unit)"]
    ProductService --> SPU["SPU (Standard product unit)"]
    ProductService --> Categories[Categories]
    ProductService --> Brand[Brand]
    ProductService --> Comments[Comments]
    ProductService --> Other[...]

    classDef userStyle fill:#f9a825,stroke:#333,stroke-width:2px,color:#000
    classDef coreStyle fill:#8bc34a,stroke:#333,stroke-width:2px,color:#000
    classDef serviceStyle fill:#ffb74d,stroke:#333,stroke-width:2px,color:#000
    classDef productServiceStyle fill:#e1bee7,stroke:#333,stroke-width:2px,color:#000
    classDef dataStyle fill:#f48fb1,stroke:#333,stroke-width:2px,color:#000

    class User userStyle
    class Core coreStyle
    class InventoriesService,CartService,UserService,FlashSaleService,ShopService,OrderService,EllipsisService,AnotherService serviceStyle
    class ProductService productServiceStyle
    class Media,SKU,SPU,Categories,Brand,Comments,Other dataStyle
```

```mermaid
graph LR
    iPhone[iPhone] --> color[color]
    iPhone --> Gb[Gb]

    color --> red[red]
    color --> blue[blue]

    Gb --> storage64[64]
    Gb --> storage128[128]
    Gb --> storage256[256]

    blue -.-> sku1["iphone 11 64Gb blue"]
    storage64 -.-> sku1

    blue -.-> sku2["iphone 11 128Gb blue"]
    storage128 -.-> sku2

    blue -.-> sku3["iphone 11 256Gb blue"]
    storage256 -.-> sku3

    classDef productStyle fill:#1f2937,stroke:#fff,stroke-width:2px,color:#fff
    classDef attributeStyle fill:#f97316,stroke:#333,stroke-width:2px,color:#000
    classDef valueStyle fill:#f97316,stroke:#333,stroke-width:2px,color:#000
    classDef storageStyle fill:#1f2937,stroke:#f97316,stroke-width:2px,color:#f97316
    classDef skuStyle fill:none,stroke:none,color:#4ade80

    class iPhone productStyle
    class color,Gb attributeStyle
    class red,blue valueStyle
    class storage64,storage128,storage256 storageStyle
    class sku1,sku2,sku3 skuStyle
```

# SKU and SPU

**SKU (Stock Keeping Unit)** and **SPU (Standard Product Unit)** are inventory management concepts that help businesses organize and track their products, but they work at different levels of detail.

## SKU (Stock Keeping Unit)

Think of a SKU as a unique "fingerprint" for each specific variation of a product. It's the most detailed level of product identification.

**What makes a SKU unique:**

- Every different variation gets its own SKU
- Changes in size, color, material, packaging, or any other attribute create a new SKU
- Even the same product sold in different locations might have different SKUs

**Example:**
Let's say you're selling a t-shirt:

- Red t-shirt, size Medium = SKU: RED-TSHIRT-M-001
- Red t-shirt, size Large = SKU: RED-TSHIRT-L-001
- Blue t-shirt, size Medium = SKU: BLUE-TSHIRT-M-001
- Blue t-shirt, size Large = SKU: BLUE-TSHIRT-L-001

Each combination gets its own unique SKU code.

## SPU (Standard Product Unit)

An SPU groups together all the different SKUs that represent the same basic product. It's like a "family" that contains all the variations.

**What an SPU represents:**

- The core product concept, regardless of variations
- Groups all related SKUs under one umbrella
- Used for broader product management and analysis

**Using the same t-shirt example:**

- SPU: "Cotton T-Shirt Style #001"
- This SPU would contain all the SKUs: RED-TSHIRT-M-001, RED-TSHIRT-L-001, BLUE-TSHIRT-M-001, BLUE-TSHIRT-L-001

## Key Differences

**Granularity:**

- SKUs are highly specific (every variation is separate)
- SPUs are broader (one product concept with multiple variations)

**Use Cases:**

- SKUs are used for inventory tracking, warehouse management, and point-of-sale systems
- SPUs are used for product catalog management, marketing analysis, and reporting

**Customer Perspective:**

- Customers typically see SPUs on product pages (one main product)
- They select specific attributes that determine which SKU they're actually buying

## Real-World Application

Imagine an online store selling shoes:

**SPU Level:** "Nike Air Max 270"

- This is what customers see as the main product

**SKU Level:** Each specific combination

- Nike Air Max 270, Black, Size 9, Men's = SKU: NIKE-AM270-BLK-9-M
- Nike Air Max 270, Black, Size 10, Men's = SKU: NIKE-AM270-BLK-10-M
- Nike Air Max 270, White, Size 9, Men's = SKU: NIKE-AM270-WHT-9-M

The store's inventory system tracks each SKU individually, but marketing reports might analyze performance at the SPU level to understand how well the "Nike Air Max 270" product line is doing overall.

This system helps businesses maintain accurate inventory while also being able to analyze broader product trends and customer preferences.

## Summary

- **SKU**: Specific product variations (size, color, etc.) - used for detailed inventory tracking
- **SPU**: Product families that group related SKUs - used for broader analysis and catalog management
- Both are essential for effective inventory management and business analytics
