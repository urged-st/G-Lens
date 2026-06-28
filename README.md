G-Lens

A real-time gravitational lensing simulator. Drag a massive object across actual Hubble and JWST deep field images and watch it warp the light from background galaxies using a GLSL fragment shader.

What it does


Drag the lens anywhere on the image
Adjust mass with the slider. Higher mass means stronger, wider distortion
Switch between presets: Simple, Black Hole, Neutron Star, Galaxy Cluster
Toggle lensing on/off to compare with the undistorted image
Switch between three real deep field backgrounds (Leo P, HUDF 2014, HUDF 2003)
Reset everything back to defaults with the reset button


How it works

The actual light deflection is handled by a WebGL fragment shader (render.js), not p5.js. The shader computes a deflection angle for each pixel based on its distance from the lens position, using a simplified version of the gravitational lensing formula. p5.js runs as a separate canvas layer on top for the UI, lens visuals, and controls.

The deflection in the shader runs in aspect-ratio-corrected UV space so the distortion is circular rather than elliptical regardless of window dimensions.

Stack


WebGL (GLSL fragment shader) for lensing
p5.js v1.11.5 for UI and lens visuals
Vanilla JS/HTML/CSS for the overlay and controls
No physics libraries


Background images


Leo P dwarf galaxy — JWST NIRCam
Hubble Ultra Deep Field 2014
Hubble Ultra Deep Field 2003


Running it

Just open index.html in a browser. 

Works best on a laptop or desktop — not touch compatible.
