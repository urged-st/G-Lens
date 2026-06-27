let massSlider;
let toggleBtn;
let resetBtn;
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
        name: 'Leo P (JWST)',
        path: 'assets/LeoP.jpg',
        scale: 1.0
    },
    {
        name: 'HUDF 2014',
        path: 'assets/bg2.webp',
        scale: 0.8
    },
    {
        name: 'HUDF 2003',
        path: 'assets/bg3.jpg',
        scale: 0.5
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

        // null triggers loading text in draw() while fetch is in flight
        bgImg = null;
        loadImage(chosen.path, img =>
        {
            bgImg = img;
            setBackground(chosen.path, chosen.scale);
        });
    });

    // reset button
    resetBtn = createButton('reset');
    resetBtn.position(20, 170);
    resetBtn.style('z-index', '2');
    resetBtn.style('font-family', 'Space Mono, monospace');
    resetBtn.style('font-size', '11px');
    resetBtn.style('background', 'rgba(10,18,32,0.85)');
    resetBtn.style('color', 'rgba(255,255,255,0.45)');
    resetBtn.style('border', '1px solid rgba(255,255,255,0.2)');
    resetBtn.style('border-radius', '6px');
    resetBtn.style('padding', '6px 12px');
    resetBtn.style('cursor', 'pointer');
    resetBtn.style('letter-spacing', '0.1em');
    resetBtn.style('text-transform', 'uppercase');

    resetBtn.mousePressed(() =>
    {
        // sliders + preset back to defaults
        massSlider.value(2500);
        currentPreset = 'simple';
        presetSelect.value('Simple');
        mass = 2500;

        // lensing on
        lensingVisible = true;
        toggleBtn.html('hide lensing');

        // lens back to centre
        lensX = 0.5;
        lensY = 0.5;
    });

    currentBg = backgrounds[0].name;
    bgImg = loadImage(backgrounds[0].path);
    initGL();
}

function drawLens(x, y, m)
{
    let strength = m * 0.00000015 * currentBgScale;
    let baseSize = sqrt(strength) * width * 2.4;

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
        // bright blue glow ring — obvious but not a flat disc
        for(let r = baseSize * 1.4; r > baseSize * 0.6; r -= 3)
        {
            let a = map(r, baseSize * 0.6, baseSize * 1.4, 120, 0);
            fill(100, 180, 255, a);
            noStroke();
            circle(x, y, r);
        }

        // solid bright core so it's still clearly visible
        fill(160, 210, 255, 180);
        noStroke();
        circle(x, y, baseSize * 0.6);
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
        // wide, faint haze
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
        resetBtn.hide();
    }
    else
    {
        massSlider.show();
        presetSelect.show();
        toggleBtn.show();
        bgSelect.show();
        resetBtn.show();
    }

    mass = massSlider.value();

    let x = lensX * width;
    let y = lensY * height;

    // loading indicator while bg image is fetching
    if(!bgImg)
    {
        fill(180, 210, 255, 120);
        textSize(13);
        textAlign(CENTER, CENTER);
        text('loading background...', width / 2, height / 2);
        textAlign(LEFT, BASELINE);
    }

    if (lensingVisible) drawLens(x, y, mass);

    // labels + stats
    textFont('Space Mono');
    textSize(12);
    fill(255);

    // control labels inline with each element
    text('mass',   170, 33);
    text('preset', 170, 68);
    text('toggle', 170, 103);

    // stats block — sits below reset button
    let statsY = 220;
    let lineH  = 22;

    // backing rect — top padding 10, bottom padding 10
    noStroke();
    fill(0, 0, 0, 100);
    rect(10, statsY - 10, 260, lineH * 4 + 20);

    fill(180, 210, 255);
    textSize(10);
    text('PRESET',        20, statsY + 4);
    text('DISTORTION',    20, statsY + lineH + 4);
    text('LENS POSITION', 20, statsY + lineH * 2 + 4);
    text('LENSING',       20, statsY + lineH * 3 + 4);

    fill(255);
    textSize(12);
    text(presets[currentPreset].label,               120, statsY + 4);
    text(nf(mass * 0.00000015 * currentBgScale, 1, 4), 120, statsY + lineH + 4);
    text(nf(lensX, 1, 3) + '  ' + nf(lensY, 1, 3), 120, statsY + lineH * 2 + 4);

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
    text(lensingVisible ? 'ON' : 'OFF', 120, statsY + lineH * 3 + 4);
}

function mousePressed()
{
    if(document.getElementById('info-overlay').classList.contains('visible'))
    {
        return;
    }

    if(mouseX < 220 && mouseY < 340)
    {
        return;
    }

    // drag works regardless of lensing toggle — looks broken otherwise
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

    // keep lens out of the controls zone (top-left ~220x320px)
    // if it's in the x range of the panel, push it below the panel bottom
    let panelW = 220 / width;
    let panelH = 340 / height;

    if(lensX < panelW && lensY < panelH)
    {
        // nudge whichever axis is closer to the panel edge
        let distFromRight  = lensX - panelW;
        let distFromBottom = lensY - panelH;

        if(distFromRight > distFromBottom)
        {
            lensX = panelW;
        }
        else
        {
            lensY = panelH;
        }
    }

    lensX = constrain(lensX, 0, 1);
    lensY = constrain(lensY, 0, 1);
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