# MongoDB Atlas Connection Troubleshooting

## Issue: SSL Handshake Failed on Render

If you're seeing errors like:
```
SSL handshake failed: ac-gz4wq3b-shard-00-01.oj99brt.mongodb.net:27017: [SSL: TLSV1_ALERT_INTERNAL_ERROR]
```

This is typically a **MongoDB Atlas configuration issue**, not a code issue.

---

## ✅ Fix Steps:

### 1. **Check IP Whitelist in MongoDB Atlas**

**This is the #1 most common cause!**

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to your cluster → **Network Access**
3. Check **IP Access List**
4. **Add Render's IP addresses** or use:
   - Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (for development) or **"Add Current IP Address"**
   - **Recommended for Render:** Use `0.0.0.0/0` to allow all IPs (only for testing/development)
   
   ⚠️ **For Production:** Use specific IP addresses only

### 2. **Verify Connection String Format**

Your `MONGO_DETAILS` environment variable should use one of these formats:

**Option A: SRV Connection String (Recommended)**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
```

**Option B: Standard Connection String**
```
mongodb://<username>:<password>@cluster0-shard-00-00.xxxxx.mongodb.net:27017,cluster0-shard-00-01.xxxxx.mongodb.net:27017,cluster0-shard-00-02.xxxxx.mongodb.net:27017/<database>?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
```

**Important:** 
- Username and password should be URL-encoded if they contain special characters
- The connection string should include `?retryWrites=true&w=majority` at the end

### 3. **Verify Database User Credentials**

1. Go to MongoDB Atlas → **Database Access**
2. Verify your database user exists and has the correct password
3. Make sure the user has proper permissions (at minimum: `readWrite` on your database)

### 4. **Check Connection String in Render**

1. Go to Render Dashboard → Your Service → **Environment**
2. Verify `MONGO_DETAILS` environment variable is set correctly
3. Make sure there are no extra spaces or quotes
4. The connection string should be in this format:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/visualDictionaryDB?retryWrites=true&w=majority
   ```

### 5. **Test Connection String**

You can test your connection string using MongoDB Compass or mongo shell:
```
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/visualDictionaryDB"
```

---

## 🔧 Quick Fixes:

### Fix #1: Allow All IPs (Development Only)
1. MongoDB Atlas → Network Access
2. Add IP Address → `0.0.0.0/0` → Confirm
3. Wait 1-2 minutes for changes to propagate

### Fix #2: Verify Connection String
Make sure your `MONGO_DETAILS` in Render includes:
- Correct username and password (URL-encoded if needed)
- Correct cluster name
- Database name: `visualDictionaryDB`
- Parameters: `?retryWrites=true&w=majority`

Example:
```
mongodb+srv://myuser:mypass%40@cluster0.abc123.mongodb.net/visualDictionaryDB?retryWrites=true&w=majority
```

Note: `%40` is URL-encoded `@` symbol if your password contains special characters.

---

## 📝 Render Environment Variable Setup

In Render Dashboard:
1. Go to **Environment** tab
2. Add or Edit `MONGO_DETAILS`:
   - **Key:** `MONGO_DETAILS`
   - **Value:** Your full MongoDB Atlas connection string
   - Make sure it's set, not just in Secrets

---

## 🧪 Testing Connection

After making changes:

1. **Redeploy** your service on Render
2. Check the **Logs** tab
3. Look for: `✅ Successfully connected to MongoDB!`
4. If you still see errors, check:
   - IP whitelist (most common)
   - Connection string format
   - Database user credentials

---

## ⚠️ Common Mistakes:

1. ❌ Not whitelisting Render's IP addresses
2. ❌ Wrong password in connection string
3. ❌ Missing database name in connection string
4. ❌ Connection string has extra quotes or spaces
5. ❌ Using old connection string format
6. ❌ Database user doesn't have proper permissions

---

## 🔍 Still Not Working?

1. **Check MongoDB Atlas Logs:**
   - Go to Atlas → Monitoring → Logs
   - Look for connection attempts and failures

2. **Verify Database Name:**
   - Make sure `visualDictionaryDB` exists in your cluster
   - Or update the database name in your connection string

3. **Try Manual Connection:**
   - Use MongoDB Compass to test the connection string
   - If Compass works, the issue is likely IP whitelist

4. **Check Render Logs:**
   - Look for the exact error message
   - Share the full error for more specific help

---

## ✅ Success Indicators:

When it's working, you'll see in Render logs:
```
✅ Successfully connected to MongoDB!
Application startup complete.
```

And no SSL handshake errors!

