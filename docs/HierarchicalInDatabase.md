# Hierarchical Data Structure

## Parent-child model

This approach adds a parent_id field to store information about each node's parent.
Example Structure:

| ID  | Name                 | Parent_ID |
| --- | -------------------- | --------- |
| 1   | ELECTRONICS          | NULL      |
| 2   | TELEVISIONS          | 1         |
| 3   | PORTABLE ELECTRONICS | 1         |
| 4   | TUBE                 | 2         |
| 5   | LCD                  | 2         |
| 6   | PLASMA               | 2         |
| 7   | MP3 PLAYERS          | 3         |
| 8   | CD PLAYERS           | 3         |
| 9   | 2 WAY RADIOS         | 3         |

![alt text](Images/parent-child-model.png)

## Materialized Path

Similar to parent-child but instead of parent_id, it uses a path column to store the complete path from root to current node.

Example Structure:

| ID  | Name                 | Path  |
| --- | -------------------- | ----- |
| 1   | ELECTRONICS          | 1     |
| 2   | TELEVISIONS          | 1/2   |
| 3   | PORTABLE ELECTRONICS | 1/3   |
| 4   | TUBE                 | 1/2/4 |
| 5   | LCD                  | 1/2/5 |
| 6   | PLASMA               | 1/2/6 |
| 7   | MP3 PLAYERS          | 1/3/7 |
| 8   | CD PLAYERS           | 1/3/8 |
| 9   | 2 WAY RADIOS         | 1/3/9 |

## Nested set model

The Nested Set Model is a powerful way to represent hierarchical (tree-like) data in a relational database. It encodes the tree structure by assigning two numbers—`left` and `right`—to each node, based on a depth-first traversal. This allows for efficient queries to retrieve entire subtrees, leaf nodes, and node depth, but makes insertions and deletions more complex.

### How It Works

- Each node is visited twice during a depth-first traversal: once when entering (assign `left`), and once when exiting (assign `right`).
- The root node's `left` is always 1, and its `right` is the largest number (2 × number of nodes).
- All descendants of a node have `left` and `right` values between the parent's `left` and `right`.
- Leaf nodes have consecutive `left` and `right` values (difference of 1).

#### Example Tree

```text
ELECTRONICS
├── TELEVISIONS
│   ├── TUBE
│   ├── LCD
│   └── PLASMA
└── PORTABLE ELECTRONICS
    ├── MP3 PLAYERS
    ├── CD PLAYERS
    └── 2 WAY RADIOS
```

#### Table Representation

| ID  | Name                 | Left | Right |
| --- | -------------------- | ---- | ----- |
| 1   | ELECTRONICS          | 1    | 18    |
| 2   | TELEVISIONS          | 2    | 9     |
| 3   | TUBE                 | 3    | 4     |
| 4   | LCD                  | 5    | 6     |
| 5   | PLASMA               | 7    | 8     |
| 6   | PORTABLE ELECTRONICS | 10   | 17    |
| 7   | MP3 PLAYERS          | 11   | 12    |
| 8   | CD PLAYERS           | 13   | 14    |
| 9   | 2 WAY RADIOS         | 15   | 16    |

#### Visual Representation

![Nested Set Model](Images/Nested-set-model.png)

### Key Operations

#### 1. Finding All Descendants of a Node

To get all descendants of a node, select nodes whose `left` and `right` are between the parent's values:

```sql
SELECT * FROM nested_category WHERE left > @parent_left AND right < @parent_right;
```

#### 2. Finding Leaf Nodes

Leaf nodes have `right - left = 1`:

```sql
SELECT name FROM nested_category WHERE (right - left) = 1;
```

#### 3. Finding Node Depth

Node depth is the number of ancestors (parents) a node has:

```sql
SELECT node.name, (COUNT(parent.name) - 1) AS depth
FROM nested_category AS node, nested_category AS parent
WHERE node.left BETWEEN parent.left AND parent.right
GROUP BY node.name
ORDER BY node.left;
```

#### 4. Inserting a New Node

To insert a new node as a child of a parent node:

1. Update all nodes with `left` or `right` greater than the parent's `right` by adding 2.
2. Insert the new node with `left = parent.right`, `right = parent.right + 1`.

**Example:** Add "GAME CONSOLES" as a new child of "ELECTRONICS" after "TELEVISIONS":

- Update all nodes with `left` or `right` > 9 (TELEVISIONS' right) by +2.
- Insert `GAME CONSOLES (10, 11)`.

#### 5. Deleting a Node

To delete a node (and its subtree):

1. Delete all nodes with `left` and `right` between the node's `left` and `right`.
2. Subtract `(right - left + 1)` from all nodes with `left` or `right` greater than the deleted node's `right`.

### Advantages

- Efficient subtree and ancestor queries (single query, no recursion).
- Good for read-heavy, static hierarchies.

### Disadvantages

- Insertions, deletions, and moves require updating many rows (can be slow for large trees).
- More complex to implement than parent-child or materialized path models.

### When to Use

- When you need to frequently query entire subtrees or hierarchies.
- When the tree structure is relatively static (few insertions/deletions).

---

**Data Structure**:
Each node stores two values:

- left: Entry point number
- right: Exit point number

### Finding Leaf Nodes

Leaf nodes are identified when `right - left = 1` (consecutive numbers with no children in between).

**Diagram:**

```
Leaf Node Check:
TUBE (3,4)        → 4-3 = 1 ✓ (Leaf)
LCD (5,6)         → 6-5 = 1 ✓ (Leaf)
PLASMA (7,8)      → 8-7 = 1 ✓ (Leaf)
MP3 PLAYERS (11,12) → 12-11 = 1 ✓ (Leaf)
CD PLAYERS (13,14)  → 14-13 = 1 ✓ (Leaf)
2 WAY RADIOS (15,16) → 16-15 = 1 ✓ (Leaf)

Non-Leaf Nodes:
TELEVISIONS (2,9)     → 9-2 = 7 ✗ (Has children)
PORTABLE ELECTRONICS (10,17) → 17-10 = 7 ✗ (Has children)
ELECTRONICS (1,18)    → 18-1 = 17 ✗ (Has children)
```

**SQL Query:**

```sql
SELECT name FROM nested_category WHERE (right - left) = 1;
```

### Finding Node Depth

Node depth is determined by counting how many parent nodes contain it.

**Depth Calculation Diagram:**

```
Node Ranges and Their Parents:

ELECTRONICS (1,18)          → Depth 0 (Root)
├── TELEVISIONS (2,9)       → Depth 1 (1 parent: ELECTRONICS)
│   ├── TUBE (3,4)          → Depth 2 (2 parents: ELECTRONICS, TELEVISIONS)
│   ├── LCD (5,6)           → Depth 2 (2 parents: ELECTRONICS, TELEVISIONS)
│   └── PLASMA (7,8)        → Depth 2 (2 parents: ELECTRONICS, TELEVISIONS)
└── PORTABLE ELECTRONICS (10,17) → Depth 1 (1 parent: ELECTRONICS)
    ├── MP3 PLAYERS (11,12)     → Depth 2 (2 parents: ELECTRONICS, PORTABLE ELECTRONICS)
    ├── CD PLAYERS (13,14)      → Depth 2 (2 parents: ELECTRONICS, PORTABLE ELECTRONICS)
    └── 2 WAY RADIOS (15,16)    → Depth 2 (2 parents: ELECTRONICS, PORTABLE ELECTRONICS)
```

**Parent-Child Containment:**

```
For TUBE (3,4):
- ELECTRONICS (1,18): 1 ≤ 3 AND 4 ≤ 18 ✓ (Contains TUBE)
- TELEVISIONS (2,9):  2 ≤ 3 AND 4 ≤ 9  ✓ (Contains TUBE)
- Total Parents: 2, Depth = 2
```

**SQL Query:**

```sql
SELECT node.name, (COUNT(parent.name) - 1) AS depth
FROM nested_category AS node, nested_category AS parent
WHERE node.lft BETWEEN parent.lft AND parent.rgt
GROUP BY node.name
ORDER BY node.lft;
```

### Adding a New Node

**Algorithm:**

1. Create space for the new node (2 units)
2. Increase `left` and `right` values of nodes to the right by 2
3. Insert the new node with appropriate `left` and `right` values

**Example:** Adding "GAME CONSOLES" between TELEVISIONS and PORTABLE ELECTRONICS

**Step 1 - Original State:**

| Name                 | Left | Right |                                    |
| -------------------- | ---- | ----- | ---------------------------------- |
| ELECTRONICS          | 1    | 18    |                                    |
| TELEVISIONS          | 2    | 9     |                                    |
| TUBE                 | 3    | 4     |                                    |
| LCD                  | 5    | 6     |                                    |
| PLASMA               | 7    | 8     |                                    |
| PORTABLE ELECTRONICS | 10   | 17    | ← Insert point is after position 9 |
| MP3 PLAYERS          | 11   | 12    |                                    |
| CD PLAYERS           | 13   | 14    |                                    |
| 2 WAY RADIOS         | 15   | 16    |                                    |

**Step 2 - After Updating Right Nodes (+2):**

| Name                 | Left | Right | Change    |
| -------------------- | ---- | ----- | --------- |
| ELECTRONICS          | 1    | 20    | +2        |
| TELEVISIONS          | 2    | 9     | No change |
| TUBE                 | 3    | 4     | No change |
| LCD                  | 5    | 6     | No change |
| PLASMA               | 7    | 8     | No change |
| PORTABLE ELECTRONICS | 12   | 19    | +2 each   |
| MP3 PLAYERS          | 13   | 14    | +2 each   |
| CD PLAYERS           | 15   | 16    | +2 each   |
| 2 WAY RADIOS         | 17   | 18    | +2 each   |

**Step 3 - After Inserting GAME CONSOLES:**

| Name                 | Left | Right |                     |
| -------------------- | ---- | ----- | ------------------- |
| ELECTRONICS          | 1    | 20    |                     |
| TELEVISIONS          | 2    | 9     |                     |
| TUBE                 | 3    | 4     |                     |
| LCD                  | 5    | 6     |                     |
| PLASMA               | 7    | 8     |                     |
| GAME CONSOLES        | 10   | 11    | ← New node inserted |
| PORTABLE ELECTRONICS | 12   | 19    |                     |
| MP3 PLAYERS          | 13   | 14    |                     |
| CD PLAYERS           | 15   | 16    |                     |
| 2 WAY RADIOS         | 17   | 18    |                     |

**Visual Representation:**

```text
Before:
ELECTRONICS (1,18)
├── TELEVISIONS (2,9)
└── PORTABLE ELECTRONICS (10,17)

After:
ELECTRONICS (1,20)
├── TELEVISIONS (2,9)
├── GAME CONSOLES (10,11)     ← New node
└── PORTABLE ELECTRONICS (12,19)
```

### Deleting a Node

**Algorithm:**

1. Delete the selected node (and all its children if it's not a leaf)
2. Update `left` and `right` values of remaining nodes
3. Decrease values by `(right - left + 1)` units for nodes to the right

**Example:** Deleting "MP3 PLAYERS" node

**Step 1 - Original State:**

| Name                 | Left | Right |                  |
| -------------------- | ---- | ----- | ---------------- |
| ELECTRONICS          | 1    | 18    |                  |
| TELEVISIONS          | 2    | 9     |                  |
| TUBE                 | 3    | 4     |                  |
| LCD                  | 5    | 6     |                  |
| PLASMA               | 7    | 8     |                  |
| PORTABLE ELECTRONICS | 10   | 17    |                  |
| MP3 PLAYERS          | 11   | 12    | ← Node to delete |
| CD PLAYERS           | 13   | 14    |                  |
| 2 WAY RADIOS         | 15   | 16    |                  |

**Step 2 - After Deleting MP3 PLAYERS:**

```text
Deleted range: (11,12) → Width = 12-11+1 = 2 units
Nodes to update: All nodes with left or right > 12
```

**Step 3 - After Updating Remaining Nodes (-2):**

| Name                 | Left | Right | Change    |
| -------------------- | ---- | ----- | --------- |
| ELECTRONICS          | 1    | 16    | -2        |
| TELEVISIONS          | 2    | 9     | No change |
| TUBE                 | 3    | 4     | No change |
| LCD                  | 5    | 6     | No change |
| PLASMA               | 7    | 8     | No change |
| PORTABLE ELECTRONICS | 10   | 15    | -2        |
| CD PLAYERS           | 11   | 12    | -2 each   |
| 2 WAY RADIOS         | 13   | 14    | -2 each   |

**Visual Representation:**

```text
Before:
PORTABLE ELECTRONICS (10,17)
├── MP3 PLAYERS (11,12)      ← To be deleted
├── CD PLAYERS (13,14)
└── 2 WAY RADIOS (15,16)

After:
PORTABLE ELECTRONICS (10,15)
├── CD PLAYERS (11,12)       ← Shifted left
└── 2 WAY RADIOS (13,14)     ← Shifted left
```

**Complex Example:** Deleting a node with children

If deleting "TELEVISIONS" (which has 3 children):

```text
TELEVISIONS (2,9) contains:
├── TUBE (3,4)
├── LCD (5,6)
└── PLASMA (7,8)

Delete range: (2,9) → Width = 9-2+1 = 8 units
All child nodes are automatically removed
All nodes with left/right > 9 are decreased by 8
```

**Note:** Deleting a non-leaf node removes all its descendants as well.

## Summary

Use **Parent-Child** Model when:

- Working with simple data structures
- Few levels in hierarchy
- Fast retrieval is not critical
- Frequent insertions/updates

Use **Materialized Path** or **Nested Set Model** when:

- Working with deep hierarchies
- Multiple levels of data
- Fast data retrieval is essential
- Read operations are more frequent than write operations
