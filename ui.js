function setup() {

    createCanvas(
        windowWidth,
        windowHeight

    );
    clear()
    initGL();
}

function draw() {

    clear();

    fill(
        100,
        180,
        255
    );

    noStroke();

    circle(
        lensX * width,
        lensY * height,
        30
    );

    fill(255);

    text(
        "G-Lens",
        20,
        30
    );
}

function mouseDragged() {

    lensX =
        mouseX / width;

    lensY =
        mouseY / height;
}

function windowResized() {

    resizeCanvas(
        windowWidth,
        windowHeight
    );

    resizeGL();
}