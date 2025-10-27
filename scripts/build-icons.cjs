#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SVG_DIR = 'src/assets/icons/svg';
const OUTPUT_FILE = 'src/assets/icons/icons.json';

function extractSvgData(svgContent, filename) {
  // Remove the file extension to get the icon name
  const iconName = path.basename(filename, '.svg');
  
  // Extract viewBox for width, height, and viewBox
  const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
  let width = 20, height = 20, viewBox = "0 0 20 20"; // default values
  
  if (viewBoxMatch) {
    viewBox = viewBoxMatch[1];
    const viewBoxParts = viewBox.split(/\s+/);
    if (viewBoxParts.length >= 4) {
      // viewBox format: "x y width height"
      width = parseInt(viewBoxParts[2]) || 20;
      height = parseInt(viewBoxParts[3]) || 20;
    }
  }
  
  // More robust SVG content extraction
  // Remove XML declaration if present
  let content = svgContent.replace(/<\?xml[^>]*>/g, '');
  
  // Find opening and closing svg tags
  const openTagMatch = content.match(/<svg[^>]*>/);
  const closeTagIndex = content.lastIndexOf('</svg>');
  
  if (!openTagMatch || closeTagIndex === -1) {
    console.warn(`⚠️  Could not find svg tags in ${filename}`);
    return { name: iconName, body: '', width, height, viewBox };
  }
  
  const openTagEnd = content.indexOf('>', content.indexOf('<svg')) + 1;
  let innerContent = content.substring(openTagEnd, closeTagIndex).trim();
  
  // The following replacement logic has been commented out to preserve original SVG colors.
  // This allows for icons with both fixed colors and dynamic (currentColor) parts.
  /*
  innerContent = innerContent
      .replace(/fill="[^"]*"/g, 'fill="currentColor"')
    .replace(/fill='[^']*'/g, 'fill="currentColor"')
    .replace(/fill-opacity="[^"]*"/g, '')
    .replace(/fill-opacity='[^']*'/g, '');
  */
  
  return {
    name: iconName,
    body: innerContent,
    width,
    height,
    viewBox
  };
}

function generateIconsJson() {
  const iconsData = {
    prefix: 'custom',
    icons: {}
  };
  
  try {
    // Check if SVG directory exists
    if (!fs.existsSync(SVG_DIR)) {
      console.log(`📁 SVG directory (${SVG_DIR}) doesn't exist yet. Creating...`);
      fs.mkdirSync(SVG_DIR, { recursive: true });
      console.log('✅ Directory created. Please add your SVG files there.');
      return;
    }
    
    // Read all SVG files
    const files = fs.readdirSync(SVG_DIR).filter(file => file.endsWith('.svg'));
    
    if (files.length === 0) {
      console.log(`📂 No SVG files found in ${SVG_DIR}`);
      console.log('💡 Add your SVG files to this directory and run the script again.');
      return;
    }
    
    console.log(`🔍 Found ${files.length} SVG file(s):`);
    
    // Variables to determine if all icons have the same dimensions
    let commonWidth = null;
    let commonHeight = null;
    let commonViewBox = null;
    let allSameDimensions = true;
    
    files.forEach(file => {
      const filePath = path.join(SVG_DIR, file);
      const svgContent = fs.readFileSync(filePath, 'utf-8');
      const iconData = extractSvgData(svgContent, file);
      
      // Check if all icons have the same dimensions
      if (commonWidth === null) {
        commonWidth = iconData.width;
        commonHeight = iconData.height;
        commonViewBox = iconData.viewBox;
      } else if (commonWidth !== iconData.width || commonHeight !== iconData.height) {
        allSameDimensions = false;
      }
      
      iconsData.icons[iconData.name] = {
        body: iconData.body,
        width: iconData.width,
        height: iconData.height,
        viewBox: iconData.viewBox
      };
      
      console.log(`   ✅ ${iconData.name} (${iconData.width}x${iconData.height}, ${iconData.body.length} chars)`);
    });
    
    // Set common dimensions if all icons have the same size
    if (allSameDimensions && commonWidth !== null) {
      iconsData.width = commonWidth;
      iconsData.height = commonHeight;
      iconsData.viewBox = commonViewBox;
      console.log(`📏 All icons have common dimensions: ${commonWidth}x${commonHeight} (${commonViewBox})`);
    }
    
    // Write the icons.json file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(iconsData, null, 2));
    console.log(`🎉 Generated ${OUTPUT_FILE} with ${Object.keys(iconsData.icons).length} icons!`);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
  }
}

// Run the script
generateIconsJson(); 