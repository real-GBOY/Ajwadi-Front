# S3 File Upload Guide

This guide explains how to handle file uploads to S3 in the Ajwadi Frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [File Purposes](#file-purposes)
4. [File Types](#file-types)
5. [API Reference](#api-reference)
6. [Usage Examples](#usage-examples)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The S3 upload system uses a **two-step process**:

1. **Get Upload URL**: Request a signed upload URL from your backend API
2. **Upload to S3**: Upload the file directly to S3 using the signed URL

The system automatically handles:
- ✅ Cross-platform support (Web, Android, iOS)
- ✅ File type detection from file extensions
- ✅ Content type detection (MIME types)
- ✅ Base64 encoding for native platforms
- ✅ Blob handling for web platform

## Quick Start

### Basic Upload

```typescript
import { uploadFile } from '@/services/s3';

// Upload a profile picture
const fileInfo = await uploadFile(
  fileUri,           // File URI from ImagePicker/DocumentPicker
  'profile.jpg',     // File name
  'profile',         // File purpose
  'image'            // File type hint (optional, auto-detected)
);

// Use the file info in your API requests
console.log(fileInfo.fileId);  // Use this in your API
console.log(fileInfo.token);   // Use this in your API
```

### Complete Example: Profile Picture Upload

```typescript
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '@/services/s3';

const pickAndUploadImage = async () => {
  try {
    // 1. Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const { uri } = result.assets[0];
    const fileName = uri.split('/').pop() || `image-${Date.now()}.jpg`;

    // 2. Upload to S3
    const fileInfo = await uploadFile(
      uri,
      fileName,
      'profile',
      'image'
    );

    // 3. Use fileInfo in your API call
    await updateProfile({
      profilePicture: [{
        fileId: fileInfo.fileId,
        token: fileInfo.token,
        purpose: 'profile'
      }]
    });

    console.log('Upload successful!');
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

## File Purposes

File purposes define **why** you're uploading the file. Always use the correct purpose:

| Purpose | Description | Use Case |
|---------|-----------|----------|
| `profile` | Profile pictures | User profile photos |
| `identity` | Identity documents | ID cards, passports (maps to `'other'` in API) |
| `project` | Project files | Project attachments |
| `projectfiles` | Project delivery files | Work delivery files |
| `proposal` | Proposal files | Proposal attachments |
| `message` | Message attachments | Chat file attachments |
| `portfolio` | Portfolio items | Freelancer portfolio |
| `tag` | Tag files | Specialization/tag images |
| `other` | Other files | Generic file uploads |

**Important Notes:**
- `identity` files are automatically mapped to `'other'` when sent to the API
- Always use `'identity'` in your code, the service handles the mapping

## File Types

File types define **what kind** of file you're uploading:

| Type | Description | Examples |
|------|-----------|----------|
| `image` | Image files | `.jpg`, `.png`, `.gif`, `.webp` |
| `document` | Document files | `.pdf`, `.doc`, `.docx`, `.xlsx` |
| `video` | Video files | `.mp4`, `.mov`, `.avi` |
| `audio` | Audio files | `.mp3`, `.wav`, `.m4a` |
| `other` | Other files | Unknown file types |

**Auto-Detection:**
The system automatically detects file type from the file extension. You can provide a hint, but detection takes priority for documents.

```typescript
// PDF will be detected as 'document' even if you pass 'image'
await uploadFile(uri, 'document.pdf', 'project', 'image');
// ✅ Correctly detected as 'document'
```

## API Reference

### `uploadFile(fileUri, fileName, filePurpose, fileType?)`

Main function to upload a file to S3.

**Parameters:**
- `fileUri: string` - File URI from ImagePicker/DocumentPicker
- `fileName: string` - Original file name (used for type detection)
- `filePurpose: InternalFilePurpose` - File purpose (`'profile' | 'identity' | 'tag'`)
- `fileType?: FileType` - File type hint (optional, auto-detected)

**Returns:**
```typescript
Promise<UploadedFileInfo>
```

**UploadedFileInfo:**
```typescript
{
  fileId: string;      // Use this in API requests
  token: string;        // Use this in API requests
  purpose: string;      // File purpose
  fileName: string;     // Final file name
}
```

### `getUploadUrl(request)`

Get a signed upload URL from the backend (used internally by `uploadFile`).

**Parameters:**
```typescript
{
  fileName: string;
  fileType: FileType;
  filePurpose: FilePurpose;
}
```

**Returns:**
```typescript
Promise<UploadUrlResponse>
```

### `uploadFileToS3(uploadUrl, fileUri, contentType)`

Upload file directly to S3 using signed URL (used internally by `uploadFile`).

**Parameters:**
- `uploadUrl: string` - Signed S3 upload URL
- `fileUri: string` - File URI
- `contentType: string` - MIME type (e.g., `'image/jpeg'`)

## Usage Examples

### 1. Profile Picture Upload

```typescript
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '@/services/s3';

const uploadProfilePicture = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (result.canceled) return;

  const { uri } = result.assets[0];
  const fileName = uri.split('/').pop() || `profile-${Date.now()}.jpg`;

  const fileInfo = await uploadFile(uri, fileName, 'profile', 'image');

  // Use in API
  await updateUserProfile({
    profilePicture: [{
      fileId: fileInfo.fileId,
      token: fileInfo.token,
      purpose: 'profile'
    }]
  });
};
```

### 2. Identity Document Upload

```typescript
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '@/services/s3';

const uploadIdentityDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/*', 'application/pdf'],
  });

  if (result.canceled) return;

  const { uri, name } = result.assets[0];
  const fileName = name || `identity-${Date.now()}.pdf`;

  const fileInfo = await uploadFile(uri, fileName, 'identity', 'document');

  // Use in API - note: 'identity' maps to 'other' in API
  await submitIdentityVerification({
    identityPicture: [{
      fileId: fileInfo.fileId,
      token: fileInfo.token,
      purpose: 'identity'  // Service handles mapping to 'other'
    }]
  });
};
```

### 3. Project File Upload

```typescript
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '@/services/s3';

const uploadProjectFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',  // Allow all file types
  });

  if (result.canceled) return;

  const { uri, name, mimeType } = result.assets[0];
  const fileName = name || `file-${Date.now()}`;

  // File type is auto-detected from extension
  const fileInfo = await uploadFile(uri, fileName, 'project', 'document');

  // Use in API
  await createProject({
    files: [{
      fileId: fileInfo.fileId,
      token: fileInfo.token,
      purpose: 'project'
    }]
  });
};
```

### 4. Multiple Files Upload

```typescript
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '@/services/s3';

const uploadMultipleImages = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
  });

  if (result.canceled) return;

  // Upload all files in parallel
  const uploadPromises = result.assets.map(async (asset) => {
    const fileName = asset.uri.split('/').pop() || `image-${Date.now()}.jpg`;
    return uploadFile(asset.uri, fileName, 'portfolio', 'image');
  });

  const fileInfos = await Promise.all(uploadPromises);

  // Use in API
  await updatePortfolio({
    portfolioFiles: fileInfos.map(info => ({
      fileId: info.fileId,
      token: info.token,
      purpose: 'portfolio'
    }))
  });
};
```

### 5. With Loading State

```typescript
import { useState } from 'react';
import { uploadFile } from '@/services/s3';

const MyComponent = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (fileUri: string, fileName: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload file
      const fileInfo = await uploadFile(fileUri, fileName, 'profile', 'image');

      setUploadProgress(100);
      console.log('Upload complete:', fileInfo);

      // Use fileInfo in API call
      // ...
    } catch (error) {
      console.error('Upload failed:', error);
      alert('فشل في رفع الملف');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    // Your UI with loading state
  );
};
```

### 6. With Error Handling

```typescript
import { uploadFile } from '@/services/s3';

const uploadWithErrorHandling = async (fileUri: string, fileName: string) => {
  try {
    const fileInfo = await uploadFile(fileUri, fileName, 'profile', 'image');
    return { success: true, fileInfo };
  } catch (error: any) {
    // Handle specific error types
    if (error.message.includes('فشل في الحصول على رابط التحميل')) {
      return { success: false, error: 'فشل في الاتصال بالخادم' };
    }
    if (error.message.includes('فشل في رفع الملف')) {
      return { success: false, error: 'فشل في رفع الملف إلى S3' };
    }
    return { success: false, error: error.message || 'حدث خطأ غير متوقع' };
  }
};
```

## Best Practices

### 1. Always Use Arrays for File References

When sending file references to the API, **always use arrays**, even for single files:

```typescript
// ✅ CORRECT
{
  profilePicture: [{
    fileId: fileInfo.fileId,
    token: fileInfo.token,
    purpose: 'profile'
  }]
}

// ❌ WRONG
{
  profilePicture: {
    fileId: fileInfo.fileId,
    token: fileInfo.token,
    purpose: 'profile'
  }
}
```

### 2. Use Correct File Purpose

Always use the correct file purpose for your use case:

```typescript
// ✅ Profile picture
await uploadFile(uri, fileName, 'profile', 'image');

// ✅ Identity document
await uploadFile(uri, fileName, 'identity', 'document');

// ✅ Project file
await uploadFile(uri, fileName, 'project', 'document');
```

### 3. Let Auto-Detection Work

The system auto-detects file types from extensions. Trust the detection:

```typescript
// ✅ Let it auto-detect
await uploadFile(uri, 'document.pdf', 'project');
// Will correctly detect as 'document'

// ⚠️ Only provide hint if needed
await uploadFile(uri, 'file', 'profile', 'image');
// Hint used when extension is missing
```

### 4. Handle File Names Properly

Extract file names from URIs or use meaningful names:

```typescript
// ✅ Extract from URI
const fileName = uri.split('/').pop() || `file-${Date.now()}.jpg`;

// ✅ Use original name from picker
const fileName = result.assets[0].name || `file-${Date.now()}`;

// ✅ Generate meaningful names
const fileName = `profile-${userId}-${Date.now()}.jpg`;
```

### 5. Use Try-Catch for Error Handling

Always wrap uploads in try-catch:

```typescript
try {
  const fileInfo = await uploadFile(uri, fileName, 'profile', 'image');
  // Handle success
} catch (error) {
  // Handle error - show user-friendly message
  console.error('Upload failed:', error);
  alert('فشل في رفع الملف. يرجى المحاولة مرة أخرى.');
}
```

### 6. Show Loading States

Provide user feedback during uploads:

```typescript
const [isUploading, setIsUploading] = useState(false);

const handleUpload = async () => {
  setIsUploading(true);
  try {
    await uploadFile(uri, fileName, 'profile', 'image');
  } finally {
    setIsUploading(false);
  }
};
```

## Troubleshooting

### Issue: "فشل في الحصول على رابط التحميل"

**Cause:** Backend API is not responding or endpoint is incorrect.

**Solution:**
- Check your API base URL in `src/config/endPoints.ts`
- Verify the endpoint `ENDPOINTS.S3_UPLOAD_URL` is correct
- Check network connectivity
- Verify authentication token is valid

### Issue: "فشل في رفع الملف إلى S3"

**Cause:** S3 upload failed (network, permissions, or invalid URL).

**Solution:**
- Check internet connection
- Verify the signed URL is valid (not expired)
- Check file size limits
- Verify S3 bucket permissions

### Issue: File Type Detection Wrong

**Cause:** File extension missing or incorrect.

**Solution:**
- Ensure file has proper extension (`.jpg`, `.pdf`, etc.)
- Provide explicit `fileType` hint if needed
- Check file name includes extension

### Issue: Upload Works but File Not Accessible

**Cause:** File reference not properly sent to API.

**Solution:**
- Verify you're using `fileId` and `token` in API request
- Ensure file reference is in array format: `[{ fileId, token, purpose }]`
- Check API endpoint accepts file references correctly

### Issue: Base64 Encoding Errors (Native)

**Cause:** File reading failed on Android/iOS.

**Solution:**
- Verify file URI is valid
- Check file permissions
- Ensure file exists at the URI
- Try using `expo-file-system` directly for debugging

### Issue: Blob Errors (Web)

**Cause:** File fetch failed on web.

**Solution:**
- Verify file URI is accessible
- Check CORS settings
- Ensure file is from allowed origin
- Try using `FileReader` API directly for debugging

## Additional Resources

- **Service Implementation**: `src/services/s3.ts`
- **Type Definitions**: `src/types/file.ts`
- **API Endpoints**: `src/config/endPoints.ts`
- **Example Usage**: 
  - `src/hooks/project/project.utils.ts` (project files)
  - `src/hooks/proposal/proposal.utils.ts` (proposal files)
  - `src/hooks/chat/useChatFileAttachment.ts` (chat attachments)

## Summary

1. **Use `uploadFile()`** for all file uploads
2. **Provide correct `filePurpose`** (profile, identity, project, etc.)
3. **Let auto-detection handle file types** (or provide hint if needed)
4. **Always use arrays** for file references in API requests
5. **Handle errors gracefully** with try-catch
6. **Show loading states** for better UX

The system handles all the complexity of cross-platform file uploads automatically! 🚀
