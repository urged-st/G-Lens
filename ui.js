let massSlider;
let toggleBtn;
let dragStartX = 0;
let dragStartY = 0;
let draggingLens = false;
let presetSelect;
let currentPreset = 'simple';
let lensingVisible = true
let bgImg;
let bgSelect;
let currentBg;
let currentBgScale = 1.0;

const backgrounds = [
    {
        name: 'Leo P (Dwarf Galaxy)',
        path: 'assets/LeoP.jpg',
        scale: 1.0
    },
    {
        name: 'Hubble Ultra Deep Field 2014',          // TODO: rename once you know what it is
        path: 'assets/bg2.webp',        // TODO: swap to your actual filename
        scale: 0.8                     // TODO: tune by eye once it's loaded
    }
];

const presets =
{
    simple:
    {
        mass: 2500,
        label: 'Simple'
    },
    blackhole:
    {
        mass: 12000,
        label: 'Black Hole'
    },
    neutronstar:
    {
        mass: 7000,
        label: 'Neutron Star'
    },
    galaxycluster:
    {
        mass: 18000,
        label: 'Galaxy Cluster'
    }
};

function setup()
{
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('position', 'absolute');
    cnv.style('top', '0');
    cnv.style('left', '0');
    cnv.style('z-index', '1');
    textFont("Space Mono");

    massSlider = createSlider(500, 20000, 2500, 100);
    massSlider.position(20, 20);
    massSlider.style('z-index', '2');

    massSlider.input(() =>
    {
        currentPreset = 'simple';
        presetSelect.value('Simple');
    });

    presetSelect = createSelect();
    presetSelect.position(20, 55);
    presetSelect.style('z-index', '2');
    presetSelect.option('Simple');
    presetSelect.option('Black Hole');
    presetSelect.option('Neutron Star');
    presetSelect.option('Galaxy Cluster');
    presetSelect.selected('Simple');

    presetSelect.changed(() =>
    {
        let val = presetSelect.value();

        if(val === 'Simple')        { currentPreset = 'simple';       }
        if(val === 'Black Hole')    { currentPreset = 'blackhole';     }
        if(val === 'Neutron Star')  { currentPreset = 'neutronstar';   }
        if(val === 'Galaxy Cluster'){ currentPreset = 'galaxycluster'; }

        massSlider.value(presets[currentPreset].mass);
        mass = presets[currentPreset].mass;
    });

    // toggle lensing button
    toggleBtn = createButton('hide lensing');
    toggleBtn.position(20, 90);
    toggleBtn.style('z-index', '2');
    toggleBtn.style('font-family', 'Space Mono, monospace');
    toggleBtn.style('font-size', '11px');
    toggleBtn.style('background', 'rgba(10,18,32,0.85)');
    toggleBtn.style('color', '#4da3ff');
    toggleBtn.style('border', '1px solid rgba(77,163,255,0.45)');
    toggleBtn.style('border-radius', '6px');
    toggleBtn.style('padding', '6px 12px');
    toggleBtn.style('cursor', 'pointer');
    toggleBtn.style('letter-spacing', '0.1em');
    toggleBtn.style('text-transform', 'uppercase');

    toggleBtn.mousePressed(() => {
        lensingVisible = !lensingVisible;
        toggleBtn.html(lensingVisible ? 'hide lensing' : 'show lensing');
    });

    // background switcher
    bgSelect = createSelect();
    bgSelect.position(20, 135);
    bgSelect.style('z-index', '2');

    for (let i = 0; i < backgrounds.length; i++)
    {
        bgSelect.option(backgrounds[i].name);
    }

    bgSelect.selected(backgrounds[0].name);

    bgSelect.changed(() =>
    {
        let chosen = backgrounds.find(b => b.name === bgSelect.value());

        if (!chosen) return;

        currentBg = chosen.name;
        currentBgScale = chosen.scale;

        bgImg = loadImage(chosen.path);
        setBackground(chosen.path, chosen.scale);
    });

    currentBg = backgrounds[0].name;
    bgImg = loadImage(backgrounds[0].path);
    initGL();
}

function drawLens(x, y, m)
{
    let strength = m * 0.00000015;
    let baseSize = sqrt(strength) * 1800 * currentBgScale;

    // sniffing the bg pixel under the lens to see if its sitting on smth bright
    let alignBoost = 0;

    if(bgImg)
    {
        let sx = floor((x / width) * bgImg.width);
        let sy = floor((y / height) * bgImg.height);

        sx = constrain(sx, 0, bgImg.width - 1);
        sy = constrain(sy, 0, bgImg.height - 1);

        let px = bgImg.get(sx, sy);
        let brightness = (px[0] + px[1] + px[2]) / 3;

        alignBoost = map(brightness, 100, 255, 0, 1);
        alignBoost = constrain(alignBoost, 0, 1);
    }

    if(currentPreset === 'simple')
    {
        noStroke();
        fill(100, 180, 255);
        circle(x, y, baseSize * 1.4);
    }
    else if(currentPreset === 'blackhole')
    {
        // outer glow for the bh
        for(let r = baseSize * 2; r > baseSize; r -= 4)
        {
            let glowAlpha = map(r, baseSize, baseSize * 2, 60, 0);

            // glow gets a lil juicier when something bright's behind it
            glowAlpha += alignBoost * 40;

            fill(255, 160, 40, glowAlpha);
            noStroke();
            circle(x, y, r);
        }

        // dark centre
        fill(0);
        noStroke();
        circle(x, y, baseSize);
    }
    else if(currentPreset === 'neutronstar')
    {
        // tight, bright core 
        let glowAlpha = 80 + alignBoost * 40;

        noStroke();
        fill(180, 220, 255, glowAlpha);
        circle(x, y, baseSize * 1.5);
        fill(220, 240, 255);
        circle(x, y, baseSize * 0.6);
    }
    else if(currentPreset === 'galaxycluster')
    {
        // wide, faint haze (⬇ if need be u can change if it looks bad)
        for(let r = baseSize * 2.5; r > 0; r -= 6)
        {
            let glowAlpha = map(r, 0, baseSize * 2.5, 40, 0);

            // same brightness sniff trick as the other presets
            glowAlpha += alignBoost * 25;

            fill(160, 100, 255, glowAlpha);
            noStroke();
            circle(x, y, r);
        }
    }
}

function draw()
{
    clear();

    // hide p5 controls when info is open
    const infoOpen =
        document.getElementById('info-overlay')
        .classList.contains('visible');

    if(infoOpen)
    {
        massSlider.hide();
        presetSelect.hide();
        toggleBtn.hide();
        bgSelect.hide();
    }
    else
    {
        massSlider.show();
        presetSelect.show();
        toggleBtn.show();
        bgSelect.show();
    }

    mass = massSlider.value();

    let x = lensX * width;
    let y = lensY * height;

    if (lensingVisible) drawLens(x, y, mass);

    // labels + stats
    textFont('Space Mono');
    textSize(12);
    fill(255);

    // mass label inline with slider
    text('mass', 170, 33);

    // stats block starts below the four controls
    // stats block starts below the four controls
    let statsY = 175;
    let lineH  = 25;

    // subtle backing box for readability
    noStroke();
    fill(0, 0, 0, 35);
    rect(10, statsY - 18, 260, lineH * 5 + 15);

    fill(180, 210, 255);

    fill(180, 210, 255);
    textSize(10);
    text('PRESET', 20, statsY);
    text('DISTORTION', 20, statsY + lineH);
    text('LENS POSITION', 20, statsY + lineH * 2);
    text('LENSING', 20, statsY + lineH * 3);
    text('BACKGROUND', 20, statsY + lineH * 4);

    fill(255);
    textSize(12);
    text(presets[currentPreset].label, 120, statsY);
    text(nf(mass * 0.00000015, 1, 4), 120, statsY + lineH);
    text(nf(lensX, 1, 3) + '  ' + nf(lensY, 1, 3), 120, statsY + lineH * 2);

    // lensing status colour
    if(lensingVisible)
    {
        fill(77, 163, 255);
    }
    else
    {
        fill(255, 80, 80);
    }

    textSize(12);
    text(lensingVisible ? 'ON' : 'OFF', 120, statsY + lineH * 3);

    fill(255);
    text(currentBg, 120, statsY + lineH * 4);
}

function mousePressed()
{
    if(document.getElementById('info-overlay').classList.contains('visible'))
    {
        return;
    }

    if(mouseX < 220 && mouseY < 160)
    {
        return;
    }   


    if (!lensingVisible) return;

    

    let lensScreenX = lensX * width;
    let lensScreenY = lensY * height;

    let dx = mouseX - lensScreenX;
    let dy = mouseY - lensScreenY;

    if(sqrt(dx*dx + dy*dy) < 40)
    {
        draggingLens = true;
        dragStartX = mouseX - lensScreenX;
        dragStartY = mouseY - lensScreenY;
    }
}

function mouseDragged()
{
    if(!draggingLens) return;

    lensX = (mouseX - dragStartX) / width;
    lensY = (mouseY - dragStartY) / height;
}

function mouseReleased()
{
    draggingLens = false;
}

function windowResized()
{
    resizeCanvas(windowWidth, windowHeight);
    resizeGL();
}