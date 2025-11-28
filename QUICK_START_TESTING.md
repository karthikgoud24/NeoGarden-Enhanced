# 🚀 Quick Start - Testing Guide

## Prerequisites
- Frontend running on http://localhost:3000
- Backend running on http://localhost:8000 (optional for core features)
- Node.js dependencies installed (`npm install` in `/frontend`)
- Python dependencies installed (`pip install -r requirements.txt` in `/backend`)

---

## Testing Workflow (15 minutes)

### Step 1: Land & Area Setup (2 min)
1. Open http://localhost:3000 in browser
2. Click "Start" on landing page
3. Input area: **50** (square meters)
4. Draw land polygon (click to place 4-5 points, close the shape)
5. Verify land shape displays correctly

### Step 2: Place Trees (4 min)
1. Click on a plant from the library (e.g., "Oak Tree")
2. Click in the garden to place tree
3. Repeat to place **20-25 trees** total
4. **Verify**: 
   - Trees appear without overcrowding
   - Sizes are proportional
   - Performance is smooth
   - No console errors (F12 → Console tab)

### Step 3: View Plant List (2 min)
1. Look at right panel showing plant list
2. Verify all 20+ plants are listed with indices
3. Click delete button on 3 random plants
4. **Verify**:
   - Plants disappear from list
   - 3D scene updates immediately
   - Toast shows "Plant deleted" message

### Step 4: Export Garden (2 min)
1. Click blue "Export" button in control panel
2. Check Downloads folder for `Garden-YYYY-MM-DD.json` file
3. Open file in text editor to verify structure
4. **Verify**:
   - JSON is valid and readable
   - Contains areaConfig, landShape, plants array
   - All tree data is present (position, colors, type, etc.)
   - Toast showed "Garden exported successfully"

### Step 5: Reset & Import (3 min)
1. Click red "Reset" button → confirm deletion
2. Garden clears, trees disappear
3. Click blue "Import" button
4. Select the JSON file you exported in Step 4
5. **Verify**:
   - Garden state fully restored
   - All 20+ trees reappear in original positions
   - Toast shows "Garden imported successfully"
   - Can see plants in list again

### Step 6: Error Handling (2 min)
1. Create invalid JSON file (corrupt the downloaded file)
2. Try to import it
3. **Verify**: Error toast appears with helpful message
4. Try with empty/incomplete JSON
5. **Verify**: Still shows error, app doesn't crash

---

## Success Criteria Checklist

### Trees & Scaling
- [ ] 20+ trees placed without visual overcrowding
- [ ] Trees scale proportionally to land area selected
- [ ] No rendering artifacts or clipping
- [ ] Console shows no errors (F12)

### Plant Management
- [ ] All plants visible in right panel list
- [ ] Delete buttons work correctly
- [ ] Trees immediately removed from 3D view
- [ ] Toast notifications confirm actions

### Export Feature
- [ ] File downloads with correct timestamp
- [ ] JSON file is valid and parseable
- [ ] All plant data is complete
- [ ] Success toast appears

### Import Feature
- [ ] File picker opens on button click
- [ ] Gardens fully restore from JSON
- [ ] All plants return to correct positions
- [ ] Success toast confirms import

### Error Handling
- [ ] Invalid JSON shows error toast
- [ ] App doesn't crash on bad input
- [ ] User can retry after error
- [ ] Error messages are clear

---

## Quick Validation Commands

### Test API Endpoints (Optional)
```bash
# Get all saved gardens (if backend persistence is enabled)
curl http://localhost:8000/api/gardens

# Check backend health
curl http://localhost:8000/api/

# View Swagger API docs
# Open: http://localhost:8000/docs
```

### Check Frontend Console
1. Press F12 in browser
2. Click "Console" tab
3. Should show only warnings (no errors)
4. Look for "Compiled successfully" message on page load

---

## Troubleshooting

### Issue: Trees look too large/small
- Check if land area was entered correctly
- Adjust area value and recreate to see scaling change
- Scale formula uses 50 sqm as reference baseline

### Issue: Import fails with error
- Verify JSON file is not corrupted
- Check that all required fields are present (areaConfig, landShape, plants)
- Try re-exporting and re-importing

### Issue: Performance degrades with many trees
- This is normal at 30+ trees (depends on GPU)
- 20-25 trees should run smoothly on most machines
- Check GPU usage in task manager

### Issue: Backend not responding
- Verify backend is running: `python -m uvicorn server:app --reload`
- Check for errors in terminal window where backend started
- Frontend works without backend (except API endpoints)

---

## Performance Benchmarks

**Expected Performance** (on typical laptop):
- 20 trees: Smooth (60 fps)
- 25 trees: Smooth (50-60 fps)  
- 30+ trees: Acceptable (30-50 fps, depends on GPU)

**Memory Usage**:
- Frontend: ~150-200 MB
- Backend: ~100-150 MB

---

## Files To Monitor

Check these files if you need to modify behavior:

| Feature | File | Key Function |
|---------|------|--------------|
| Scaling | `frontend/src/components/3d/Garden3D.jsx` | `calculateScaleFactor()` |
| Export | `frontend/src/App.js` | `handleExportGarden()` |
| Import | `frontend/src/App.js` | `handleImportGarden()` |
| UI Buttons | `frontend/src/components/ControlPanel.jsx` | Export/Import buttons |
| Plant List | `frontend/src/components/PlantsList.jsx` | Plant rendering |
| Backend API | `backend/server.py` | Garden endpoints |

---

## Expected Results Summary

✅ **Scaling**: 20+ trees fit naturally in garden without crowding
✅ **Export**: Click → Download → Valid JSON with all data
✅ **Import**: Select file → Garden restored exactly as saved
✅ **Delete**: Removes plants from list and 3D view instantly
✅ **Errors**: Graceful handling with helpful messages
✅ **Performance**: Smooth interactions at normal tree count

---

## Next Steps

1. **Pass full testing**: Complete all steps above
2. **Optional**: Enable backend persistence (add save/load UI)
3. **Optional**: Add more features (undo/redo, search, etc.)
4. **Deploy**: Ready for production deployment

---

**Estimated Testing Time**: 15-20 minutes
**Difficulty Level**: Easy (just click buttons and verify results)
**Success Rate Target**: 100% (all tests should pass)
