# 📱 iOS Recording Troubleshooting Guide

This guide helps you resolve recording issues on iOS devices (iPhone, iPad) with ToneBridge.

## 🚨 Common iOS Recording Issues

### 1. "API transaction failed" Error

**Symptoms:**
- Recording starts but fails when stopping
- Error message: "API transaction failed" or similar
- No transcription appears

**Causes:**
- HTTPS requirement not met
- Network connectivity issues
- Audio format compatibility problems
- Server connection issues

## 🔧 Step-by-Step Solutions

### Step 1: Verify HTTPS Setup

iOS Safari requires HTTPS for microphone access when accessing from local IP addresses.

**Check if you're using HTTPS:**
1. Look at your browser URL bar
2. Should show `https://` not `http://`
3. If using localhost, HTTP is allowed

**Fix HTTPS issues:**
```bash
# Generate SSL certificates (if not already done)
./generate-certs.bat  # Windows
./generate-certs.sh   # macOS/Linux

# Start with HTTPS
./start-https.bat     # Windows
./start-https.sh      # macOS/Linux
```

### Step 2: Accept Self-Signed Certificate

When accessing HTTPS for the first time:

1. **Safari on iOS:**
   - Tap "Advanced" or "Show Details"
   - Tap "Visit Website" or "Accept"
   - May need to go to Settings > Safari > Advanced > Website Data > Clear

2. **Chrome on iOS:**
   - Tap "Advanced"
   - Tap "Proceed to [IP] (unsafe)"

### Step 3: Check Network Connectivity

**Test from your phone:**
1. Open Safari/Chrome on your iPhone
2. Go to: `https://YOUR_COMPUTER_IP:5000/health`
3. Should see: `{"status":"healthy","service":"ToneBridge API"}`

**If connection fails:**
- Check firewall settings
- Ensure both devices are on same WiFi
- Try accessing from different browser

### Step 4: Test Microphone Access

**Manual test:**
1. Open Safari on iPhone
2. Go to any website with microphone access
3. Allow microphone permission when prompted
4. If denied, go to Settings > Safari > Microphone > Allow

**Reset permissions:**
1. Settings > Safari > Advanced > Website Data
2. Clear all website data
3. Try recording again

### Step 5: Use Compatibility Test

The app includes a built-in compatibility test:

1. Open ToneBridge in Safari
2. Look for "iOS Compatibility Test" section
3. Check all tests pass:
   - ✅ Secure Context (HTTPS/localhost)
   - ✅ Microphone Access
   - ✅ MediaRecorder Support
   - ✅ Supported Audio Formats

## 🛠️ Advanced Troubleshooting

### Check Console Logs

**On iPhone:**
1. Connect iPhone to Mac
2. Open Safari on Mac
3. Develop > [Your iPhone] > [Website]
4. Check Console for errors

**Common errors:**
```
NotAllowedError: Microphone access denied
SecurityError: Microphone access blocked
NotSupportedError: Recording not supported
```

### Test Different Browsers

Try these browsers on iOS:
1. **Safari** (recommended)
2. **Chrome for iOS**
3. **Firefox for iOS**

### Check iOS Version

**Minimum requirements:**
- iOS 11+ for basic MediaRecorder
- iOS 14+ for better compatibility
- iOS 15+ for best experience

### Audio Format Issues

iOS Safari supports limited audio formats:
- ✅ `audio/mp4`
- ✅ `audio/mp4;codecs=mp4a`
- ❌ `audio/webm` (not supported)

The app automatically detects and uses supported formats.

## 🔍 Debug Steps

### 1. Check Network Setup

**Verify your computer's IP:**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

**Test connectivity:**
```bash
# From your phone, ping your computer
ping YOUR_COMPUTER_IP
```

### 2. Check Server Status

**Test backend directly:**
```
https://YOUR_COMPUTER_IP:5000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "ToneBridge API",
  "version": "1.0.0"
}
```

### 3. Check Frontend Status

**Test frontend:**
```
https://YOUR_COMPUTER_IP:3000
```

Should load the ToneBridge interface.

### 4. Monitor Network Traffic

**Use browser dev tools:**
1. Open Safari on Mac
2. Connect to iPhone
3. Develop > [iPhone] > [Website]
4. Network tab to see API calls

## 🚀 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop all services
# Then restart with HTTPS
./start-https.bat  # Windows
./start-https.sh   # macOS/Linux
```

### Fix 2: Clear Browser Data
1. Settings > Safari > Advanced > Website Data
2. Clear All Website Data
3. Restart Safari

### Fix 3: Reset Permissions
1. Settings > Safari > Microphone
2. Set to "Ask" or "Allow"
3. Try recording again

### Fix 4: Use Localhost
If local IP doesn't work:
1. Connect iPhone to same computer via USB
2. Use `localhost:3000` instead of IP
3. Requires USB connection

## 📞 Getting Help

### Before asking for help:

1. **Run compatibility test** in the app
2. **Check console logs** for errors
3. **Test with different browsers**
4. **Verify HTTPS setup**
5. **Check network connectivity**

### Information to provide:

- iOS version
- Browser used
- Error messages
- Compatibility test results
- Network setup (HTTPS/HTTP)
- Console logs

### Common Solutions:

| Issue | Solution |
|-------|----------|
| Microphone denied | Settings > Safari > Microphone > Allow |
| HTTPS warning | Accept self-signed certificate |
| Network error | Check firewall, same WiFi network |
| Audio format error | App auto-detects supported formats |
| Server not found | Verify IP address and port |

## 🔒 Security Notes

- Self-signed certificates are safe for local development
- Only use this setup on trusted networks
- Don't expose these ports to the internet
- Consider using proper SSL certificates for production

## 📱 iOS-Specific Tips

1. **Use Safari** - Best compatibility with MediaRecorder
2. **Accept certificates** - Required for HTTPS access
3. **Allow microphone** - Grant permission when prompted
4. **Stay on same WiFi** - Both devices must be connected
5. **Check iOS version** - Update if below iOS 14

## 🎯 Success Checklist

- [ ] HTTPS URL (or localhost)
- [ ] Self-signed certificate accepted
- [ ] Microphone permission granted
- [ ] Both devices on same WiFi
- [ ] Backend server running
- [ ] Frontend accessible
- [ ] Compatibility tests pass
- [ ] Recording starts successfully
- [ ] Transcription completes

If all items are checked, recording should work on iOS! 🎉 