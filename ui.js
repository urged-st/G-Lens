let massSlider;
let dragStartX = 0;
let dragStartY = 0;
let draggingLens = false;

function setup()
{
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('position', 'absolute');
    cnv.style('top', '0');
    cnv.style('left', '0');
    cnv.style('z-index', '1');

    massSlider = createSlider(1000, 30000, 8000, 100);
    massSlider.position(20, 20);
    massSlider.style('z-index', '2');

    initGL();
}

function draw()
{
    clear();

    mass = massSlider.value();

    noStroke();
    fill(100, 180, 255);

    circle(
        lensX * width,
        lensY * height,
        30
    );
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

    if(sqrt(dx*dx + dy*dy) < 20)
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