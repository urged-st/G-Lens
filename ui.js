let massSlider;
let dragStartX = 0;
let dragStartY = 0;
let draggingLens = false;
let presetSelect;
let currentPreset = 'simple';

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

    initGL();
}

function drawLens(x, y, m)
{
    let strength = m * 0.00000015;
    let baseSize = sqrt(strength) * 1800;
    
    if(currentPreset === 'simple')
    {
        noStroke();
        fill(100, 180, 255);
        circle(x, y, baseSize);
    }
    else if(currentPreset === 'blackhole')
    {
        // outer glow
        for(let r = baseSize * 2; r > baseSize; r -= 4)
        {
            fill(255, 160, 40, map(r, baseSize, baseSize * 2, 60, 0));
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
        // tight bright core
        noStroke();
        fill(180, 220, 255, 80);
        circle(x, y, baseSize * 1.5);
        fill(220, 240, 255);
        circle(x, y, baseSize * 0.6);
    }
    else if(currentPreset === 'galaxycluster')
    {
        // wide faint haze
        for(let r = baseSize * 2.5; r > 0; r -= 6)
        {
            fill(160, 100, 255, map(r, 0, baseSize * 2.5, 40, 0));
            noStroke();
            circle(x, y, r);
        }
    }
}

function draw()
{
    clear();

    mass = massSlider.value();

    let x = lensX * width;
    let y = lensY * height;

    drawLens(x, y, mass);
}

function mousePressed()
{
    if(mouseX < 220 && mouseY < 80)
    {
        return;
    }

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