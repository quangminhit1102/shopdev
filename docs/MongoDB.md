# MongoDB Notes

## 1. Maximum Number of Documents in a Collection

- **MongoDB does not have a hard limit on the number of documents in a collection**.
- The maximum number depends on:
  - **Disk storage capacity**.
  - **Maximum collection size** (no limit on the WiredTiger engine).
  - **Index limitations** (maximum 64GB per index per collection).
  - **Sharding**, which allows scaling beyond a single node’s storage limit.

## 2. Maximum Document Size

- **A single document can be up to 16MB**.
- If you need to store larger data, use **GridFS**.

## 3. Nested Object (Embedded Documents) Limitations

- **MongoDB allows up to 100 levels of nesting**.
- If you exceed 100 levels, you will encounter an error:
  ```
  Cannot create field 'fieldName' in element because it would make the document too deep (100 levels).
  ```
- **Excessive nesting can reduce query performance**.

## 4. Solutions for Large or Deeply Nested Data

### 🔹 Normalize Data (Denormalization)

- Store related data in separate collections instead of deeply nested structures.
- Example: Instead of storing `country` as a nested object, create a separate `countries` collection.

### 🔹 Use Embedding Wisely

- **For small, frequently accessed data** → Keep it nested.
- **For large, rarely changing data** → Store it in a separate collection.

### 🔹 Use GridFS for Data Larger Than 16MB

- GridFS helps store large files by breaking them into smaller chunks.

## 5. Example of a Nested Object

```json
{
  "_id": 1,
  "name": "John Doe",
  "address": {
    "street": "123 linh xuan",
    "city": "HCM",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "details": {
        "region": "East Coast",
        "country": {
          "name": "VIET NAM",
          "code": "VN"
        }
      }
    }
  }
}
```

## 6. Conclusion ✅

- **No hard limit on the number of documents per collection**, but consider storage and indexing constraints.
- **A document can be up to 16MB**.
- **Maximum nesting depth is 100 levels**.
- **Proper data structuring improves performance and scalability**.
