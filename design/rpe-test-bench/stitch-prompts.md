# Stitch Prompts for RPE Test Bench

Use these prompts in Google Stitch MCP (or any AI UI generator) to generate the refined screens.

## 1. Dashboard Prompt
```text
Create a landing dashboard for an engineering software called 'FutolTech RPE'. 
The aesthetic should be dark mode, technical, and serious (like an engineering cockpit). Use deep navy and slate grey backgrounds with off-white text.
Include a top navigation bar.
The main content area should feature a grid of 'Recent Specimens Tested', each showing a thumbnail of a simple structure, a status badge (e.g., 'Failed at 250kph' in red, or 'Passed' in green), and a 'View Results' button.
Include a prominent 'New Simulation' primary action button.
```

## 2. RPE Test Bench - Pre-Run Setup Prompt
```text
Create the main workspace UI for an engineering simulation app called 'FutolTech RPE'. 
Use a dark, dense, technical UI style. The layout must have 4 distinct areas:
1. Left Panel (w-64): A collapsible tree view showing structural components (Site, Foundation, Frame, Wall System, Roof, Connections).
2. Center Viewport (flex-1): A large dark 3D viewer area containing a wireframe or solid 3D model of a simple house.
3. Right Panel (w-80): A 'Hazard Setup' panel containing industrial-looking inputs: a dropdown for Run Mode (Fixed Duration, Until Breaking Point), a slider for Wind Speed (kph), toggles for Rain and Debris. Include a green 'Run Simulation' button at the top.
4. Bottom Panel (h-24): A horizontal timeline scrubber currently set to 00:00.
```

## 3. RPE Test Bench - Post-Run Results Prompt
```text
Create a post-simulation results state for the right panel of an engineering app.
The background is dark slate. Use a technical, data-dense design.
Top section: A stark red 'Simulation Complete' header indicating structural failure.
Middle section: A list of 'Triggered Events' with timestamps (e.g., '00:47 - Roof edge uplift' in orange).
Lower section: An 'Upgrade Options' checklist. Show checkboxes for 'Add diagonal bracing' and 'Add roof straps', each with a cost like '+₱3,500' in green monospace font.
Bottom section: A summary block showing 'Total Added Cost: ₱6,000' and a recommendation: 'Next Specimen: A1'.
Include small secondary buttons for 'Export Video' and 'Generate Report'.
```

## 4. Material Library Prompt
```text
Create a data-dense Material Library screen for an engineering application. Dark mode, technical aesthetic.
Display a large data table with columns: Material Name, Category (Frame, Wall, Roof, Connection), Unit Size, Unit Cost (PHP), and Base Density.
Include a search bar and filter dropdowns at the top.
The rows should be compact to allow for maximum data visibility. Highlight the 'Unit Cost' column with a subtle green tint to emphasize pricing.
```
