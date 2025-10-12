# WordCompare User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Basic Usage](#basic-usage)
4. [Key Features](#key-features)
5. [Understanding Comparison Results](#understanding-comparison-results)
6. [Export Features](#export-features)
7. [Troubleshooting](#troubleshooting)

---

## Introduction

WordCompare is a web application that compares two Word documents and visually displays the changes between them.

### Key Features
- 📄 **Intuitive Document Comparison**: Side-by-side comparison of original and modified documents
- 🎨 **Visual Change Indicators**: Color-coded additions, deletions, and modifications
- 📊 **Statistical Information**: Detailed statistics about changes
- 💾 **Multiple Export Formats**: Save results as PDF, HTML, CSV, or JSON
- 🔍 **Granular Comparison Options**: Character, word, sentence, and paragraph-level comparison

---

## Getting Started

### System Requirements
- **Browser**: Chrome, Firefox, Safari, Edge (latest version recommended)
- **Internet Connection**: Required for initial load
- **File Format**: .docx (Microsoft Word documents)

### Accessing the Application
1. Open your web browser and navigate to the WordCompare website
2. Wait for the page to fully load

---

## Basic Usage

### Step 1: Upload Documents

#### Upload Original Document
1. Locate the **"Original Document"** section
2. Select a file using one of these methods:
   - **Drag and Drop**: Drag the file into the box
   - **File Selection Button**: Click "Select File" to browse

#### Upload Modified Document
1. Locate the **"Modified Document"** section
2. Use the same method to select the file

### Step 2: Configure Comparison Options

In the **Comparison Settings** panel, you can configure:

#### Comparison Detail Level
- **Character Level**: Most granular (detects individual character changes)
- **Word Level**: Word-by-word changes (recommended)
- **Sentence Level**: Sentence-level changes
- **Paragraph Level**: Paragraph-level changes

#### Comparison Options
- ☑️ **Compare Formatting**: Include font, size, color changes
- ☑️ **Case Sensitive**: Treat case differences as changes
- ☑️ **Compare Whitespace**: Detect whitespace changes
- ☑️ **Compare Tables**: Detect table content changes
- ☑️ **Compare Headers/Footers**: Include headers and footers
- ☑️ **Compare Footnotes**: Include footnote content

### Step 3: Run Comparison

1. Confirm both documents are uploaded
2. Click the **"Compare Documents"** button
3. Wait for comparison to complete (may take a few seconds)

---

## Key Features

### Document Viewer

#### Side-by-Side Mode
- Displays original and modified documents side-by-side
- Simultaneously view changed sections
- Synchronized scrolling for easy comparison

#### Unified View Mode
- View all changes in a single view
- Deleted content: Red background + strikethrough
- Added content: Green background + underline

#### Change Navigation
- **Previous/Next Buttons**: Quickly move between changes
- **Change Counter**: Shows current position (e.g., 3/10)
- **Auto-scroll**: Automatically scrolls to selected change

### Statistics Dashboard

Provides the following statistics:
- 📊 **Total Changes**
- ➕ **Additions**
- ➖ **Deletions**
- ✏️ **Modifications**
- 🔄 **Moved Content**
- 🎨 **Format Changes**

### Change Legend

Each change type is displayed as follows:
- 🟢 **Green**: Added content
- 🔴 **Red**: Deleted content
- 🟡 **Yellow**: Modified content
- 🔵 **Blue**: Moved content
- 🟣 **Purple**: Format changes

---

## Understanding Comparison Results

### Change Display Styles

#### Added Content
- **Background**: Light green
- **Left Border**: Dark green
- **Text**: Underlined
- **Location**: Modified document only

#### Deleted Content
- **Background**: Light red
- **Left Border**: Dark red
- **Text**: Strikethrough
- **Location**: Original document only

#### Modified Content
- **Background**: Light yellow
- **Left Border**: Dark yellow
- **Display**: Shown in both documents
- **Content**: Before and after content visible

### Change Location Information

Each change includes:
- **Page Number**: Page where change occurred
- **Paragraph Number**: Paragraph position within page

---

## Export Features

Save comparison results in various formats.

### PDF Export
- **Purpose**: Print-ready, shareable documents
- **Contents**: Summary report, change list, statistics
- **Usage**: Click "Export to PDF" button

### HTML Export
- **Purpose**: Share results as web page
- **Contents**: Full styling, interactive elements
- **Usage**: Click "Export to HTML" button

### CSV Export
- **Purpose**: Analysis in Excel/spreadsheets
- **Contents**: Change data in table format
- **Usage**: Click "Export to CSV" button

### JSON Export
- **Purpose**: Programming, data processing
- **Contents**: Complete comparison results (structured data)
- **Usage**: Click "Export to JSON" button

---

## Troubleshooting

### Documents Won't Upload
- ✅ Verify file is in .docx format
- ✅ Check file size (recommended: under 10MB)
- ✅ Ensure file is not corrupted
- ✅ Refresh browser and try again

### Comparison Results Don't Display
- ✅ Verify both documents are uploaded successfully
- ✅ Confirm you clicked "Compare Documents"
- ✅ Check browser console for error messages
- ✅ Refresh page and start over

### Changes Not Detected Properly
- ✅ Adjust comparison detail level (character → word)
- ✅ Check comparison options (formatting, case sensitivity)
- ✅ Verify documents actually have different content

### Export Fails
- ✅ Check browser popup blocker settings
- ✅ Verify write permissions to download folder
- ✅ Ensure sufficient disk space
- ✅ Try different export format

### Application is Slow
- ✅ Close other browser tabs
- ✅ Clear browser cache
- ✅ Check if document size is too large
- ✅ Lower comparison detail level (character → word → sentence)

---

## Additional Help

### Tips for Best Results
1. **Consistent Formatting**: Matching basic formatting improves accuracy
2. **Choose Appropriate Level**:
   - General editing: **Word level** recommended
   - Fine-grained changes: **Character level** recommended
   - Structural changes: **Paragraph level** recommended
3. **File Naming**: Use clear names (e.g., Contract_v1.docx, Contract_v2.docx)

### Keyboard Shortcuts
- `Ctrl + O`: Open file selection dialog
- `Ctrl + Enter`: Run document comparison
- `→` / `←`: Navigate to next/previous change
- `Ctrl + E`: Open export menu

---

**Version**: 1.0.0
**Last Updated**: 2025-10-11
**Contact**: WordCompare Support Team
