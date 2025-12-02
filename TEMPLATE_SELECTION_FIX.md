# Template Selection Bug Fix

## Issue
When users clicked "Change Template" in the page editor and selected a template, after confirming the replacement, the system would redirect them to the Dashboard instead of staying in the page editor with the new template applied.

## Root Cause
The `handleTemplateSelect` function in `PageEditor.tsx` had a logic issue:

1. It was checking `if (!page || !template)` which would exit early when template was `null`
2. When "Start from Scratch" was clicked (passing `null`), it would close the modal and return
3. When a real template was selected, it called `await handleSave()` which would update the page
4. However, the flow wasn't handling the response properly and the page was being redirected

## Fix Applied

### Before
```typescript
const handleTemplateSelect = async (template: any) => {
  if (!page || !template) {
    setShowTemplatePicker(false);
    return;
  }

  if (!confirm('This will replace your current page content. Are you sure?')) {
    setShowTemplatePicker(false);
    return;
  }

  setBlocks(template.blocks);
  setTheme(template.theme);
  setShowTemplatePicker(false);

  await handleSave();  // This was causing issues
};
```

### After
```typescript
const handleTemplateSelect = async (template: any) => {
  // Check if page exists
  if (!page) {
    setShowTemplatePicker(false);
    return;
  }

  // Handle "Start from Scratch" case (template is null)
  if (template === null) {
    setShowTemplatePicker(false);
    return;
  }

  // Confirm replacement
  if (!confirm('This will replace your current page content. Are you sure?')) {
    setShowTemplatePicker(false);
    return;
  }

  // Extract template data with fallbacks
  const newBlocks = template.blocks || [];
  const newTheme = template.theme || theme;

  // Update local state
  setBlocks(newBlocks);
  setTheme(newTheme);
  setShowTemplatePicker(false);

  // Save directly to database
  setSaving(true);
  const { error } = await supabase
    .from('pages')
    .update({
      content: { blocks: newBlocks, theme: newTheme },
      updated_at: new Date().toISOString(),
    })
    .eq('id', page.id);

  // Show appropriate feedback
  if (!error) {
    alert('Template applied successfully!');
  } else {
    console.error('Error applying template:', error);
    alert('Failed to apply template. Please try again.');
  }
  setSaving(false);
};
```

## Changes Made

1. **Separated Null Check**: Split the condition to handle `!page` and `template === null` separately
2. **Direct Database Update**: Instead of calling `handleSave()`, we now directly update the database
3. **Proper Fallbacks**: Added `|| []` and `|| theme` fallbacks for template data
4. **Better Feedback**: Added specific success/error messages
5. **No Navigation**: Removed any code path that could cause unwanted navigation
6. **Stay in Editor**: User remains in the page editor after template is applied

## Testing
After the fix:
1. User clicks "Change Template"
2. Template picker modal opens showing all themed templates
3. User selects a template (e.g., "Bold Creative")
4. Confirmation dialog appears
5. User confirms
6. Template is applied to the page
7. **User stays in the page editor** ✓
8. Page content updates with new template blocks and theme ✓
9. Success message is shown ✓

## Benefits
- Users can see their template applied immediately
- No unexpected navigation away from their work
- Clear success/error feedback
- Maintains editing context
- Template blocks and theme are properly saved to database

## Files Modified
- `src/pages/PageEditor.tsx` - Fixed `handleTemplateSelect` function

## Related Features
This fix ensures the new themed template library works correctly:
- 8 professional themed templates
- Visual theme previews
- AI-generated custom themes
- All now apply correctly without navigation issues
