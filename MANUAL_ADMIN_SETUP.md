# Manual Admin User Setup for MongoDB Atlas

If the `npm run seed:admin` script fails due to connection issues, you can manually create the admin user directly in MongoDB Atlas.

## Step-by-Step Instructions

### 1. Generate Password Hash

First, you need to generate a bcrypt hash for the password `footlong.29`.

**Option A: Use an online bcrypt generator**
- Go to https://bcrypt-generator.com/ or similar
- Enter `footlong.29` as the text
- Use rounds: `10`
- Copy the generated hash

**Option B: Use Node.js locally**
```javascript
// Create a file called generateHash.js
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('footlong.29', 10);
console.log(hash);
```
Run it: `node generateHash.js`

### 2. Access MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in with your credentials
3. Select your cluster (`FootLongWebsite`)
4. Click on **"Collections"** in the left sidebar

### 3. Find or Create the Users Collection

1. Look for a collection named `users`
2. If it doesn't exist:
   - Click **"Create Collection"**
   - Name it `users`
   - Click **"Create Collection"**

### 4. Insert Admin Document

1. Click on the `users` collection
2. Click **"Insert Document"**
3. Switch to **"JSON"** view (if available) or use the form
4. Insert this document (replace `YOUR_GENERATED_HASH` with the actual hash):

```json
{
  "username": "FootLong",
  "email": "admin@footlong.web",
  "password": "YOUR_GENERATED_HASH",
  "bio": "",
  "isAdmin": true,
  "_id": {
    "$oid": ""
  }
}
```

**Note**: Leave `_id` empty - MongoDB will auto-generate it.

5. Click **"Insert"**

### 5. Verify Admin User

1. Refresh the collection view
2. You should see the new document
3. The user can now log in with:
   - **Username**: `FootLong`
   - **Password**: `footlong.29`

## Alternative: Using MongoDB Compass

If you have MongoDB Compass installed:

1. Connect to your cluster using the connection string from Atlas
2. Navigate to the `users` collection
3. Click **"Insert Document"**
4. Paste the JSON document (with your hash)
5. Click **"Insert"**

## Troubleshooting

### Can't find the users collection?
- The collection is created automatically when the first user registers
- If no users exist yet, register a regular account first through the app
- Then follow the steps above to add admin privileges

### Wrong password hash?
- Delete the document and try again with a new hash
- Make sure to use bcrypt with 10 rounds

### Still having issues?
- Check that your MongoDB Atlas cluster is running
- Verify your IP is whitelisted in Network Access
- Ensure you have the correct database selected

## Security Note

After successfully creating the admin user, consider:
- Restricting IP whitelist to specific addresses in production
- Using a stronger, unique password
- Enabling MongoDB Atlas security features like encryption at rest