class DataVisualizer {
  constructor({
    baseMapUrl,
    dataMapUrl,
    width,
    height,
    dataDepth,
  }) {
    this.baseMapUrl = baseMapUrl;
    this.dataMapUrl = dataMapUrl;
    this.width = width;
    this.height = height;
    this.dataDepth = dataDepth;
  }

    async init() {
        this.scene = new THREE.Scene();

        //camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1);
        this.camera.position.set(0, 50, 50);

        const rendererOptions = {
            antialias: true,
        };
        this.renderer = new THREE.WebGLRenderer(rendererOptions);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.setupLights();

        // array of rows of values
//        const data = generateData(100, 100);

        function threshold(value, thresholdValue = 0.1) {
            return (value < thresholdValue) ? undefined : value;
        }

        const imageData = await getImageData(this.dataMapUrl, 0.25);

      function f(x) {
        // return Math.log10(x*1000)/10;
        return Math.max(0, Math.min(1, Math.exp(x * 2) / 2.2 - 1));
      }

        const data = imageData.map(row => row.map(
                ([r, g, b, a]) => threshold(f(1 - r / 255))
        ));
        const dataWidth = data.length;
        const dataHeight = data[0] ? data[0].length : 0;

//        const materials = [new THREE.MeshPhongMaterial()];
        const materials = DataVisualizer.createMaterialPalette(10);
        const mergedGeometry = new THREE.Geometry();

        for (let j = 0; j < data.length; j++) {
            const row = data[j];
            for (let i = 0; i < row.length; i++) {
                const value = row[i];
                if (value !== undefined) {
                    const cubeGeometry = new THREE.CubeGeometry(1, 1, 1);
                    const cube = new THREE.Mesh(cubeGeometry);
                    cube.applyMatrix(new THREE.Matrix4().makeTranslation(i - dataWidth / 2, 0.5, j - dataHeight / 2));
                    const y = value * this.dataDepth;
                    cube.applyMatrix(new THREE.Matrix4().makeScale(1, y, 1));
                    for (let k = 0; k < cubeGeometry.faces.length; k++) {
                        cubeGeometry.faces[k].materialIndex = Math.round((1 - value) * (materials.length - 1))
                    }
        //            this.scene.add(cube);\
                    mergedGeometry.merge(cubeGeometry, cube.matrix);
                }
            }
        }
        const mergedMesh = new THREE.Mesh(mergedGeometry, materials);

        const map = createMap({
            width: this.width,
            height: this.height,
            url: this.baseMapUrl,
        });

        this.scene.add(map);
        this.scene.add(mergedMesh);

        this.control = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        this.animate();
    }

    static createMaterialPalette(count) {
        const materials = [];
        for (let i = 0; i < count; i++) {
            const material = new THREE.MeshPhongMaterial();
            const colorComponent = Math.round(i / count * 255);
            material.color = new THREE.Color(`rgb(255, ${colorComponent}, 0)`);
            materials.push(material);
        }
        return materials;
    }

    setupLights() {
        const lights = [];

        const light1 = new THREE.PointLight(0xffffff, 0.5, 0);
        const light2 = new THREE.PointLight(0xffffff, 0.5, 0);
        const light3 = new THREE.PointLight(0xffffff, 0.5, 0);

        light1.position.set(0, 200, 0);
        light2.position.set(100, 200, 100);
        light3.position.set(-100, -200, -100);

        lights.push(light1);
        lights.push(light2);
        lights.push(light3);

        for (let i = 0; i < lights.length; i++) {
            this.scene.add(lights[i]);
        }
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(() => this.animate());
    }
}


/*
class DataVisualizer {
  constructor({
    baseMapUrl,
    dataMapUrl,
    width,
    height,
    dataDepth,
  }) {
    if (
      !baseMapUrl
      || !dataMapUrl
      || !width
      || !height
      || !dataDepth
    ) {
      throw new Error('missing param');
    }
    this.baseMapUrl = baseMapUrl;
    this.dataMapUrl = dataMapUrl;
    this.width = width;
    this.height = height;
    this.dataDepth = dataDepth;
  }

  async init() {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 50, 50);

      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(renderer.domElement);

      var lights = [];
      lights[0] = new THREE.PointLight(0xffffff, .5, 0);
      lights[1] = new THREE.PointLight(0xffffff, .5, 0);
      lights[2] = new THREE.PointLight(0xffffff, .5, 0);

      lights[0].position.set(0, 200, 0);
      lights[1].position.set(100, 200, 100);
      lights[2].position.set(- 100, - 200, - 100);

      scene.add(lights[0]);
      scene.add(lights[1]);
      scene.add(lights[2]);

      const imageData = await getImageData(this.dataMapUrl, .25);

      function f(x) {
        // return Math.log10(x*1000)/10;
        return Math.max(0, Math.min(1, Math.exp(x * 2) / 2.2 - 1));
      }

      function threshold(x, tres = 0.05) {
        return x < tres ? undefined : x;
      }

      // get only red color components since the image is greyscale
      const data = imageData.map(
        row => row.map(
          ([r, g, b, a]) => threshold(f((255 - r) / 255), 0.1)
        )
      );

      // create a palette of 10 different materials
      const materials = createMaterialPalette(10)

      var singleGeometry = new THREE.Geometry();

      const dataWidth = data.length;
      const dataHeight = !data[0] ? 0 : data[0].length;

      for (let j = 0; j < data.length; j++) {
        const row = data[j];
        for (let i = 0; i < row.length; i++) {
          const value = row[i];
          if (value !== undefined) {
            var box = new THREE.BoxGeometry(1, 1, 1);
            var cube = new THREE.Mesh(box);
            cube.applyMatrix(new THREE.Matrix4().makeTranslation(.01 + i - row.length / 2, 0.5, .01 + j - data.length / 2));
            cube.applyMatrix(new THREE.Matrix4().makeScale(this.width / dataWidth, value * this.dataDepth, this.height / dataHeight));
            //cube.updateMatrix();
            for ( var k = 0; k < box.faces.length; k++ ) {
              box.faces[k].materialIndex = Math.floor(value * (materials.length - 1));
            }
            singleGeometry.merge(cube.geometry, cube.matrix);
          }
        }
      }

      var map = createMap({ width: this.width, height: this.height, url: this.baseMapUrl });
      scene.add(map);

      var mesh = new THREE.Mesh(singleGeometry, materials);
      scene.add(mesh);

      // setup mouse controls
      const controls = setupControls(camera, renderer);

      var animate = function () {
        requestAnimationFrame(animate);

        // trigger event to update controls
        controls.update();

        renderer.render(scene, camera);
      };

      animate();

      window.addEventListener('resize', onWindowResize, false);
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
      }
  }
}
*/
