# Content & Page Management - Feature Test Plan

## Overview
This test plan covers the four major features implemented in Phase 1:
1. Pre-Built Page Templates
2. Page Duplication
3. Full-Screen Preview Mode
4. SEO Metadata Management

---

## Test Environment Setup
- [ ] Ensure you're logged into the application
- [ ] Navigate to Dashboard and verify you have access to a site
- [ ] Go to "Funnels & Pages" section

---

## Test 1: Pre-Built Page Templates

### Test 1.1: Create Homepage with Template
**Steps:**
1. Click "Create Homepage" button (if no homepage exists)
2. Template picker should appear
3. Browse through templates using category sidebar:
   - Click "Landing Pages"
   - Click "Sales Pages"
   - Click "Webinars"
   - Click "Lead Magnets"
   - Click "Coming Soon"
   - Click "About"
   - Click "Portfolio"
4. Use the search bar to search for "SaaS"
5. Click on "SaaS Product Launch" template
6. Wait for page to be created and editor to open

**Expected Results:**
- ✅ Template picker displays with professional UI
- ✅ Categories filter templates correctly
- ✅ Search functionality works
- ✅ Template cards show name, description, and preview placeholder
- ✅ Page is created with pre-configured blocks from template
- ✅ Editor opens with blocks ready to edit

### Test 1.2: Create Standalone Page with Template
**Steps:**
1. Go back to Funnels & Pages
2. Click "New Page" button
3. Enter:
   - Page Title: "Test Landing Page"
   - Page Slug: "test-landing"
   - Page Type: "Landing Page"
4. Click "Create"
5. Template picker should appear
6. Select "Lead Magnet Landing Page"

**Expected Results:**
- ✅ Template picker appears after form submission
- ✅ Page is created with lead magnet template blocks
- ✅ Page appears in "Standalone Pages" section
- ✅ All template content is editable

### Test 1.3: Start from Scratch (No Template)
**Steps:**
1. Create another new page
2. In template picker, click "Start from Scratch" card
3. Editor should open with empty page

**Expected Results:**
- ✅ Empty page created with no blocks
- ✅ Prompt to add first block appears
- ✅ Can add blocks manually

---

## Test 2: Page Duplication

### Test 2.1: Duplicate a Page
**Steps:**
1. Navigate to Funnels & Pages
2. Find your "Test Landing Page" in Standalone Pages
3. Locate the Copy icon button (between Edit and Delete)
4. Click the Copy button
5. Wait for new page to be created

**Expected Results:**
- ✅ Copy button is visible and labeled with tooltip
- ✅ New page is created immediately
- ✅ Redirected to editor for the new duplicated page
- ✅ New page title shows "(Copy)" suffix
- ✅ New page has unique slug (includes "-copy-" timestamp)
- ✅ All blocks and content are identical to original
- ✅ New page status is "draft"
- ✅ Original page remains unchanged

### Test 2.2: Duplicate a Funnel
**Steps:**
1. If you have a funnel, locate it in the Sales Funnels section
2. Click the Copy button next to the Edit button
3. Wait for duplication to complete

**Expected Results:**
- ✅ Funnel is duplicated with "(Copy)" suffix
- ✅ Redirected to funnel detail page
- ✅ Status set to "draft"
- ✅ All funnel settings preserved

### Test 2.3: Verify Duplicate Independence
**Steps:**
1. Edit the duplicated page
2. Change the headline text in the first block
3. Save the page
4. Go back and open the original page
5. Verify original page is unchanged

**Expected Results:**
- ✅ Changes to duplicate don't affect original
- ✅ Each page maintains its own content

---

## Test 3: Full-Screen Preview Mode

### Test 3.1: Basic Preview
**Steps:**
1. Open any page with content blocks in the editor
2. Click the "Preview" button in the toolbar (has Eye icon)
3. Preview overlay should appear

**Expected Results:**
- ✅ Full-screen preview overlay covers entire screen
- ✅ Top bar shows "Preview Mode" title
- ✅ All blocks render exactly as they appear in editor
- ✅ No editing controls visible (clean preview)
- ✅ "Exit Preview" button is visible and prominent

### Test 3.2: Device Preview Switching
**Steps:**
1. In preview mode, click Desktop icon (should be selected by default)
2. Click Tablet icon
3. Observe width change
4. Click Mobile icon
5. Observe further width reduction
6. Switch back to Desktop

**Expected Results:**
- ✅ Desktop view shows full width
- ✅ Tablet view shows ~768px width with gray background
- ✅ Mobile view shows ~375px width with gray background
- ✅ Content scales appropriately for each size
- ✅ Smooth transition between sizes
- ✅ Active device button is highlighted

### Test 3.3: Preview with Empty Page
**Steps:**
1. Create a new blank page (no blocks)
2. Click "Preview" button

**Expected Results:**
- ✅ Preview shows message "No Content Yet"
- ✅ Helpful text about adding blocks
- ✅ No errors or broken UI

### Test 3.4: Exit Preview
**Steps:**
1. In preview mode, click "Exit Preview" button
2. Should return to editor

**Expected Results:**
- ✅ Returns to normal editor view
- ✅ All blocks still editable
- ✅ No data loss or changes

---

## Test 4: SEO Metadata Management

### Test 4.1: Open SEO Settings
**Steps:**
1. Open any page in the editor
2. Click the "SEO" button in the toolbar (has Search icon)
3. SEO settings modal should appear

**Expected Results:**
- ✅ Modal opens with "SEO Settings" title
- ✅ Three input fields visible:
  - SEO Title
  - Meta Description
  - Social Share Image URL
- ✅ Character counters visible for title and description
- ✅ Cancel and Save buttons at bottom

### Test 4.2: Add SEO Title
**Steps:**
1. In SEO modal, enter a title: "Best SaaS Platform for Entrepreneurs | MyBrand"
2. Observe character counter

**Expected Results:**
- ✅ Title appears in input field
- ✅ Character counter updates (should show X/60)
- ✅ Counter shows optimal range guidance (50-60)
- ✅ Cannot exceed 60 characters

### Test 4.3: Add Meta Description
**Steps:**
1. Enter description: "Discover the all-in-one SaaS platform trusted by 10,000+ entrepreneurs. Start your free trial today and transform your business."
2. Observe character counter

**Expected Results:**
- ✅ Description appears in textarea
- ✅ Character counter updates (should show X/160)
- ✅ Counter shows optimal range guidance (150-160)
- ✅ Cannot exceed 160 characters

### Test 4.4: Add Social Share Image
**Steps:**
1. Enter image URL: `https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg`
2. Wait for preview to load

**Expected Results:**
- ✅ URL appears in input field
- ✅ Preview section appears below
- ✅ Image loads and displays
- ✅ Image shows at proper dimensions
- ✅ Help text shows recommended size (1200x630px)

### Test 4.5: Save SEO Settings
**Steps:**
1. Click "Save SEO Settings" button
2. Wait for save to complete
3. Close editor and reopen the same page
4. Click "SEO" button again

**Expected Results:**
- ✅ Save completes successfully
- ✅ "Page saved successfully!" alert appears
- ✅ SEO data persists after closing editor
- ✅ Reopening shows saved SEO data
- ✅ All three fields populated with saved values

### Test 4.6: Cancel Without Saving
**Steps:**
1. Open SEO modal
2. Change the title to something different
3. Click "Cancel" button
4. Reopen SEO modal

**Expected Results:**
- ✅ Modal closes without saving
- ✅ Changes are not persisted
- ✅ Original values remain unchanged

### Test 4.7: SEO with Invalid Image URL
**Steps:**
1. Open SEO modal
2. Enter invalid URL: "not-a-url"
3. Observe preview section

**Expected Results:**
- ✅ Preview doesn't break the UI
- ✅ Image fails gracefully (hidden on error)
- ✅ Can still save other SEO data

---

## Test 5: Integration Tests

### Test 5.1: Template → Preview → SEO Workflow
**Steps:**
1. Create new page with "Webinar Registration" template
2. Click "Preview" to see the template
3. Test device switching in preview
4. Exit preview
5. Click "SEO" and add metadata
6. Save page
7. Preview again to verify changes saved

**Expected Results:**
- ✅ Complete workflow works smoothly
- ✅ No errors at any step
- ✅ Data persists across actions

### Test 5.2: Duplicate → Edit → Preview → SEO
**Steps:**
1. Duplicate an existing page with content
2. Edit some blocks in the duplicate
3. Preview the changes
4. Add SEO metadata
5. Save everything

**Expected Results:**
- ✅ Duplicate has independent content
- ✅ Preview shows edited content
- ✅ SEO saves correctly
- ✅ No conflicts with original page

---

## Test 6: Edge Cases & Error Handling

### Test 6.1: Template Loading
**Steps:**
1. Clear browser cache
2. Create new page
3. Observe template picker loading

**Expected Results:**
- ✅ Loading spinner appears while fetching templates
- ✅ Templates load successfully
- ✅ No console errors

### Test 6.2: Duplicate Same Page Multiple Times
**Steps:**
1. Duplicate the same page 3 times in succession
2. Check Funnels & Pages list

**Expected Results:**
- ✅ All duplicates created successfully
- ✅ Each has unique slug with different timestamp
- ✅ All appear in page list
- ✅ No slug conflicts

### Test 6.3: Preview Page with Many Blocks
**Steps:**
1. Create page with 10+ different block types
2. Open preview
3. Test device switching

**Expected Results:**
- ✅ All blocks render in preview
- ✅ No performance issues
- ✅ Scrolling works smoothly
- ✅ Device switching responsive

---

## Regression Tests

### Test 7.1: Existing Functionality Still Works
**Steps:**
1. Create new page from scratch (no template)
2. Add blocks manually using the block library
3. Edit block content
4. Save page
5. Publish page

**Expected Results:**
- ✅ Block library still accessible
- ✅ Adding blocks works normally
- ✅ Editing blocks works normally
- ✅ Save functionality works
- ✅ Publish functionality works

### Test 7.2: AI Features Still Work
**Steps:**
1. Edit a Hero block
2. Click "Generate with AI" for headline
3. Use image search
4. Try color palette generator

**Expected Results:**
- ✅ AI text generation works
- ✅ Image search works
- ✅ Color palette works
- ✅ No conflicts with new features

---

## Test Summary Template

After completing tests, fill out this summary:

### ✅ Working Features
- [ ] Pre-built templates load and apply correctly
- [ ] Page duplication works for pages and funnels
- [ ] Full-screen preview with device switching works
- [ ] SEO metadata can be added and saved
- [ ] All features integrate smoothly together

### ❌ Issues Found
*List any bugs or problems discovered*

### 💡 Feedback
*Any suggestions or improvements*

---

## Quick Smoke Test (5 minutes)

If you want a quick sanity check before full testing:

1. Create new page → Select "SaaS Product Launch" template → Verify blocks appear ✅
2. Duplicate that page → Verify copy is created ✅
3. Click Preview → Switch devices → Exit preview ✅
4. Click SEO → Add title and description → Save ✅

If all four work, the core functionality is operational!

---

**Ready to Test?** Start with the Quick Smoke Test, then proceed through the full test plan as needed. Report back with any issues or successes!
