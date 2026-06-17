let gl;
let program;
let texture;

let lensX = 0.5;
let lensY = 0.5;
let mass = 8000;

function initGL() {

    const canvas = document.createElement("canvas");
    canvas.id = "glCanvas";

    document.body.appendChild(canvas);

    gl = canvas.getContext("webgl");

    resizeGL();

    const vert = `
        attribute vec2 a_pos;
        varying vec2 v_uv;

        void main() {

            v_uv = a_pos * 0.5 + 0.5;

            gl_Position = vec4(
                a_pos,
                0.0,
                1.0
            );
        }
    `;

    const frag = `
        precision mediump float;

        varying vec2 v_uv;

        uniform sampler2D u_tex;
        uniform vec2 u_lens;
        uniform vec2 u_res;
        uniform float u_mass;

        void main()
        {
            vec2 uv = v_uv;

            float aspect = u_res.x / u_res.y;

            vec2 lensUV = vec2(
                u_lens.x / u_res.x,
                1.0 - u_lens.y / u_res.y
            );

            // fix to work in aspect-corrected space for distance calc
            vec2 d = vec2(
                (uv.x - lensUV.x) * aspect,
                uv.y - lensUV.y
            );

            float r = length(d);

            float strength = u_mass * 0.00000015;
            float theta = strength / (r * r + 0.01);

            // apply deflection in corrected space, conv back (ong im smart for ts :3)
            uv.x -= (d.x / aspect) * theta / r;
            uv.y -= d.y * theta / r;

            uv = clamp(uv, 0.0, 1.0);

            gl_FragColor = texture2D(u_tex, uv);
        }
    `;

    function compile(type, src) {

        const s =
            gl.createShader(type);

        gl.shaderSource(
            s,
            src
        );

        gl.compileShader(s);

        return s;
    }

    const vs =
        compile(
            gl.VERTEX_SHADER,
            vert
        );

    const fs =
        compile(
            gl.FRAGMENT_SHADER,
            frag
        );

    program =
        gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    gl.linkProgram(program);

    gl.useProgram(program);

    const quad =
        gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        quad
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1,-1,
             1,-1,
            -1, 1,
             1, 1
        ]),
        gl.STATIC_DRAW
    );

    const pos =
        gl.getAttribLocation(
            program,
            "a_pos"
        );

    gl.enableVertexAttribArray(pos);

    gl.vertexAttribPointer(
        pos,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    requestAnimationFrame(render);
    loadTexture();
}

function loadTexture() {

    const img = new Image();

    img.onload = () => {

        texture =
            gl.createTexture();

        gl.bindTexture(
            gl.TEXTURE_2D,
            texture
        );

        gl.pixelStorei(
            gl.UNPACK_FLIP_Y_WEBGL,
            true
        );

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            img
        );

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MIN_FILTER,
            gl.LINEAR
        );

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_MAG_FILTER,
            gl.LINEAR
        );

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_S,
            gl.CLAMP_TO_EDGE
        );

        gl.texParameteri(
            gl.TEXTURE_2D,
            gl.TEXTURE_WRAP_T,
            gl.CLAMP_TO_EDGE
        );

        requestAnimationFrame(render);
    };

    img.src = "assets/LeoP.jpg";
}

function render() {

    if (!texture) {
        requestAnimationFrame(render);
        return;
    }

    gl.viewport(
        0,
        0,
        gl.canvas.width,
        gl.canvas.height
    );

    gl.useProgram(program);

    // bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform1i(
        gl.getUniformLocation(program, "u_tex"),
        0
    );

    gl.uniform2f(
        gl.getUniformLocation(
            program,
            "u_lens"
        ),
        lensX * innerWidth,
        lensY * innerHeight
    );

    gl.uniform1f(
        gl.getUniformLocation(
            program,
            "u_mass"
        ),
        lensingVisible ? mass : 0
    );

    gl.uniform2f(
        gl.getUniformLocation(
            program,
            "u_res"
        ),
        innerWidth,
        innerHeight
    );

    gl.drawArrays(
        gl.TRIANGLE_STRIP,
        0,
        4
    );

    requestAnimationFrame(render);
}

function resizeGL() {

    const c =
        document.getElementById(
            "glCanvas"
        );

    if (!c) return;

    c.width = innerWidth;
    c.height = innerHeight;

    if (gl) {
        gl.viewport(
            0,
            0,
            c.width,
            c.height
        );
    }
}

window.addEventListener(
    "resize",
    resizeGL
);
