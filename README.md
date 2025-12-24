# Keep Alive Service

A GitHub Actions + GitHub Pages solution to keep your web applications awake by sending periodic ping requests. Prevents Netlify (and other hosting services) from putting your apps to sleep due to inactivity.

## Features

✨ **Automated Pings** - GitHub Actions runs every 10 minutes to ping your endpoints
📊 **Dashboard** - Monitor endpoint status and view detailed ping logs
⚙️ **Easy Configuration** - Add/remove endpoints through a web dashboard
📈 **Logging** - Keep track of all ping attempts with timestamps and response times
🚀 **Zero Cost** - Runs on free GitHub Actions and GitHub Pages

## Setup Instructions

### 1. Initial Repository Setup

1. Push this repository to your GitHub account
2. Enable GitHub Pages in your repository settings:
   - Go to **Settings > Pages**
   - Set source to **Deploy from a branch**
   - Select **main** branch and **/docs** folder
   - Click Save

### 2. Configure Your Endpoints

Edit `config.json` and replace the example URLs with your actual endpoints:

```json
{
  "interval": 10,
  "endpoints": [
    {
      "name": "My Portfolio",
      "url": "https://your-portfolio.netlify.app"
    },
    {
      "name": "My Blog",
      "url": "https://your-blog.example.com"
    }
  ]
}
```

- `interval`: Minutes between pings (default: 10)
- `endpoints`: Array of endpoints to monitor
  - `name`: Display name for the endpoint
  - `url`: Full URL to ping (must be valid HTTP/HTTPS)

### 3. First Deployment

1. Commit and push all changes:
```bash
git add .
git commit -m "Initial keep-alive setup"
git push origin main
```

2. GitHub Actions will automatically run the ping job at the next scheduled interval (every 10 minutes)
3. You can manually trigger it by going to **Actions > Keep Alive Pings > Run workflow**

### 4. Access Your Dashboard

Your dashboard is available at:
```
https://<your-github-username>.github.io/<repository-name>/
```

The dashboard shows:
- ✓ All configured endpoints
- 📊 Real-time status of each endpoint
- 📋 Detailed logs of all ping attempts
- ⏱️ Response times for each request

## Managing Endpoints

### Adding a New Endpoint

1. Go to your GitHub Pages dashboard
2. Fill in the endpoint name and URL in the "Add New Endpoint" section
3. Click "Add Endpoint"
4. Download the updated `config.json` file
5. Replace the `config.json` in your repository with the downloaded file
6. Commit and push the changes:
```bash
git add config.json
git commit -m "chore: add new endpoint"
git push origin main
```

### Removing an Endpoint

1. Go to your GitHub Pages dashboard
2. Click "Remove" next to the endpoint you want to delete
3. Download the updated `config.json` file
4. Replace the `config.json` in your repository with the downloaded file
5. Commit and push the changes:
```bash
git add config.json
git commit -m "chore: remove endpoint"
git push origin main
```

## How It Works

### GitHub Actions Workflow

The `.github/workflows/keep-alive.yml` file:
- Runs every 10 minutes on a schedule (you can modify the cron: `*/10 * * * *`)
- Reads the `config.json` file to get the list of endpoints
- Makes HTTP GET requests to each endpoint
- Logs the results (status code, response time, timestamp) to `logs.json`
- Automatically commits and pushes the updated logs back to the repository

### Monitoring & Logs

The dashboard:
- Fetches `config.json` to display configured endpoints
- Fetches `logs.json` to display recent ping attempts (last 100 logs)
- Updates every minute automatically
- Shows endpoint status based on the most recent ping
- Displays response times and error messages

## Customization

### Change Ping Interval

Edit `.github/workflows/keep-alive.yml` and modify the cron schedule:

```yaml
schedule:
  - cron: '*/5 * * * *'  # Every 5 minutes
```

Common intervals:
- `*/5 * * * *` - Every 5 minutes
- `*/10 * * * *` - Every 10 minutes
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

### Modify Timeout

In `ping-endpoints.js`, adjust the timeout value:

```javascript
const response = await axios.get(endpoint.url, { timeout: 10000 }); // 10 seconds
```

### Limit Log Storage

The logs are automatically trimmed to keep only the last 1000 entries. You can modify this in `ping-endpoints.js`:

```javascript
logs = logs.slice(-1000); // Keep last 1000 logs
```

## Troubleshooting

### Logs Not Updating

1. Check if the GitHub Actions workflow is running:
   - Go to **Actions > Keep Alive Pings**
   - Look for recent workflow runs
   - If there's an error, click on the failed run to see details

2. Verify `config.json` is valid JSON:
   - Use an online JSON validator
   - Ensure all URLs are properly formatted

### Endpoints Showing as Unknown

This means no logs have been recorded yet. The workflow runs every 10 minutes:
- Check the **Actions** tab for recent workflow runs
- Wait for the next scheduled run
- Or manually trigger it from the Actions tab

### Getting 401/403 Errors

If an endpoint requires authentication, you'll see errors. This is expected:
- The service makes unauthenticated GET requests
- If your endpoint requires auth, you may need to use a public health check URL instead

### Can't See Dashboard

1. Verify GitHub Pages is enabled in your repository settings
2. Check that the docs folder exists with the `index.html` file
3. Use the correct URL: `https://<username>.github.io/<repo-name>/`
4. It may take a few minutes for GitHub Pages to build and deploy

## File Structure

```
.
├── .github/
│   └── workflows/
│       └── keep-alive.yml          # GitHub Actions workflow
├── docs/
│   └── index.html                  # Dashboard (GitHub Pages)
├── config.json                     # Endpoint configuration
├── logs.json                       # Ping logs
├── ping-endpoints.js               # Script that performs pings
├── package.json                    # Node.js dependencies
└── README.md                       # This file
```

## Important Notes

⚠️ **Public URLs Only** - This service pings publicly accessible URLs. Don't use it for private/internal endpoints.

⚠️ **Rate Limiting** - Ensure your endpoints can handle periodic GET requests without issues.

⚠️ **Monitoring** - While this keeps apps awake, it's not a replacement for proper monitoring and alerting.

## License

MIT - Feel free to use and modify this for your needs.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the GitHub Actions workflow logs for errors
3. Verify your `config.json` is valid JSON
4. Ensure your endpoints are publicly accessible

Happy pinging! 🚀
