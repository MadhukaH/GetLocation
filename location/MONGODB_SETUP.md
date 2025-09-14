# MongoDB Atlas Setup Guide

## 1. Setting up MongoDB Atlas

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account
3. Create a new cluster (free tier available)

### Step 2: Configure Database Access
1. In your Atlas dashboard, go to "Database Access"
2. Click "Add New Database User"
3. Create a user with read/write permissions
4. Choose "Password" authentication
5. Save the username and password securely

### Step 3: Configure Network Access
1. Go to "Network Access" in your Atlas dashboard
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IP addresses

### Step 4: Get Connection String
1. Go to "Database" section
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

## 2. Setting Environment Variables in Netlify

### Method 1: Through Netlify Dashboard (Recommended)

1. **Go to your Netlify site dashboard**
2. **Navigate to Site Settings**
   - Click on your site name
   - Go to "Site settings" → "Environment variables"

3. **Add the MONGODB_URI variable**
   - Click "Add a variable"
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB Atlas connection string
   - Click "Save"

4. **Example of the connection string format**:
   ```
   mongodb+srv://yourusername:yourpassword@cluster0.abc123.mongodb.net/locations?retryWrites=true&w=majority
   ```

### Method 2: Through Netlify CLI

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Link your project**:
   ```bash
   netlify link
   ```

4. **Set environment variable**:
   ```bash
   netlify env:set MONGODB_URI "your-mongodb-connection-string"
   ```

### Method 3: Through netlify.toml (Not Recommended for Secrets)

⚠️ **Warning**: Never put sensitive data like database passwords directly in `netlify.toml` as it's committed to your repository.

## 3. Testing the Connection

### Local Development
1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Start local development server**:
   ```bash
   netlify dev
   ```

3. **Set environment variable for local development**:
   ```bash
   # Windows PowerShell
   $env:MONGODB_URI="your-mongodb-connection-string"
   netlify dev

   # Windows Command Prompt
   set MONGODB_URI=your-mongodb-connection-string
   netlify dev

   # macOS/Linux
   MONGODB_URI=your-mongodb-connection-string netlify dev
   ```

### Production Deployment
1. **Commit and push your changes**:
   ```bash
   git add .
   git commit -m "Add MongoDB Atlas integration"
   git push
   ```

2. **Netlify will automatically deploy** and use the environment variables you set in the dashboard

## 4. Security Best Practices

### ✅ Do's:
- Use environment variables for sensitive data
- Set up proper database user permissions (read/write only)
- Use IP whitelisting in production
- Regularly rotate database passwords
- Use MongoDB Atlas built-in security features

### ❌ Don'ts:
- Never commit connection strings to version control
- Don't use admin/root database users for applications
- Don't use overly permissive network access in production
- Don't share connection strings in chat/email

## 5. Troubleshooting

### Common Issues:

1. **Connection Timeout**
   - Check network access settings in Atlas
   - Verify IP address is whitelisted

2. **Authentication Failed**
   - Double-check username and password
   - Ensure database user has proper permissions

3. **Environment Variable Not Found**
   - Verify the variable name is exactly `MONGODB_URI`
   - Check if the variable is set in the correct environment (production vs preview)

4. **Function Not Found**
   - Ensure your functions are in the `netlify/functions/` directory
   - Check that the function file exports a `handler` function

### Testing Your Setup:

1. **Visit your deployed site**
2. **Navigate to the "Locations (MongoDB)" tab**
3. **Click "Add New Location"**
4. **Try adding a location** - if successful, your MongoDB connection is working!

## 6. Sample Data Structure

Your MongoDB collection will store documents like this:

```javascript
{
  "_id": ObjectId("..."),
  "name": "Central Park",
  "latitude": 40.7829,
  "longitude": -73.9654,
  "description": "A large public park in Manhattan",
  "createdAt": ISODate("2024-01-15T10:30:00Z")
}
```

The functions will automatically create this collection and insert sample data if it doesn't exist.
