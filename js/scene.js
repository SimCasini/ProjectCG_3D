var cubeSize = 0.8;
var baseSize = 0.4;
var stanzaSize = 2.0;
var spessoreCubo = 0.074;
var legnoHeight = 0.45;
var legnoRadius = 0.03;
var legnoSegments = 40;
var sparkLifeTime = 0.7;
var smokeLife = 17.5;

var numFlameParticles = 2000;
var numSmokeParticles = 4000;
var baseWidth = 0.15;
var scene, camera, renderer, controls, uniforms_flame, uniforms_smoke, ambientLight, light, smokeData;

function createSmoke(n){
    var positions = new Float32Array(n * 3);
    for (var i = 0; i < positions.length; i ++) {
        var vAngle = Math.random()*Math.PI*2;
        positions[i*3] = baseWidth*Math.random()*Math.cos(vAngle);
        positions[i*3+1] = Math.random()+(uniforms_flame.speed.value + uniforms_flame.flameMinHeight.value);
        positions[i*3+2] = baseWidth*Math.random()*Math.sin(vAngle);
    }
    
    var direction = new Float32Array(n * 3);
    for (var i = 0; i < direction.length; i++) {
        var vAngle = Math.random()*Math.PI*2;
        direction[i*3] = Math.random()*2-1;
        direction[i*3 + 1] =1;
        direction[i*3 + 2] = Math.random()*2-1;
    }
    
    var uniqueness = new Float32Array(n);
    for (var i = 0; i < n; i++) {
      uniqueness[i] = Math.random();
    }
    
    var durations = new Float32Array(n);
    for(var i = 0; i < n; i++){
        durations[i] = smokeLife + smokeLife * uniqueness[i];
    }
    
    var particleOS = new Float32Array(n);
    for(var i = 0; i < n; i++){
        particleOS[i] = i/n * durations[i];
    }
    
    return {positions:positions, direction:direction, uniqueness: uniqueness, durations:durations, particleOS:particleOS }
}


function createFlame(n){
    var positions = new Float32Array(n * 3);
    for (var i = 0; i < positions.length; i ++) {
        positions[i*3] = 0.0;
        positions[i*3+1] = 0.0;
        positions[i*3+2] = 0.0;
    }
    
    var direction = new Float32Array(n * 3);
    for (var i = 0; i < direction.length; i++) {
        direction[i*3] = Math.random()*2-1;
        direction[i*3 + 1] =1;
        direction[i*3 + 2] = Math.random()*2-1;
    }
    
    var uniqueness = new Float32Array(n);
    for (var i = 0; i < n; i++) {
        uniqueness[i] = Math.random();
    }
    
    var durations = new Float32Array(n);
    for(var i = 0; i < n; i++){
        durations[i] = sparkLifeTime + sparkLifeTime * uniqueness[i];
    }
    
    var particleOS = new Float32Array(n);
    for(var i = 0; i < n; i++){
        particleOS[i] = i/n * durations[i];
    }
    
    return {positions:positions, direction: direction, uniqueness: uniqueness, durations:durations, particleOS:particleOS }
}

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,10);
    camera.position.z = 1.8;
    
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild( renderer.domElement );
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.2;
    controls.maxDistance = 5;
    controls.minHeight = 0;
    controls.maxPolarAngle = Math.PI/2;
    controls.minAzimuthAngle = -Math.PI/2;
    controls.maxAzimuthAngle = Math.PI/2;
    
    ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    light = new THREE.PointLight( 0xffffff, 1.5, 2);
    light.position.set( 0, 0.2, 0 );
    scene.add( light );

    var mattoniTexture = new THREE.TextureLoader().load( './images/mattoni.png');
    
    var baseGeometry = new THREE.BoxGeometry(cubeSize, baseSize, cubeSize);
    var baseTexture = new THREE.TextureLoader().load( './images/lastraghisa.png');
    
    var baseMaterials = [new THREE.MeshLambertMaterial({
                         map: baseTexture}), 
                     new THREE.MeshLambertMaterial({
                         map: baseTexture}), 
                     new THREE.MeshLambertMaterial({
                         map: baseTexture}), 
                     new THREE.MeshLambertMaterial({
                         trasparent: true,
                         opacity: 0,
                         alphaTest: 0.2}), 
                     new THREE.MeshLambertMaterial({
                         map: baseTexture}),
                     new THREE.MeshLambertMaterial({
                         map: baseTexture})
                    ];
    
    var base = new THREE.Mesh(baseGeometry, baseMaterials);
    base.position.set(0,-cubeSize/2+baseSize/2,0); 
    
    var latoCamGeometry = new THREE.BoxGeometry(spessoreCubo, cubeSize, cubeSize,3,3,3);
    var latoBackGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, spessoreCubo,3,3,3);  
    
    latoTexture = new THREE.TextureLoader().load('./images/mattoneSingolo.png');
    latoTexture.wrapS = THREE.RepeatWrapping;
    latoTexture.wrapT = THREE.RepeatWrapping;
    latoTexture.repeat.set( 1, 10 );
    
    latoTextureBack = new THREE.TextureLoader().load('./images/mattoneSingolo.png');
    latoTextureBack.wrapS = THREE.RepeatWrapping;
    latoTextureBack.wrapT = THREE.RepeatWrapping;
    latoTextureBack.repeat.set( 10, 1 );
     
    var latoMaterials = [new THREE.MeshLambertMaterial({
                         map: mattoniTexture}), 
                     new THREE.MeshLambertMaterial({
                         map: mattoniTexture}), 
                     new THREE.MeshLambertMaterial({
                         map: latoTexture}), 
                     new THREE.MeshLambertMaterial({
                         map: mattoniTexture}), 
                     new THREE.MeshLambertMaterial({
                         map: latoTexture}),
                     new THREE.MeshLambertMaterial({
                         trasparent: true,
                         opacity: 0,
                         alphaTest: 0.2})
                    ];
    
    var latoMaterialsBack = [new THREE.MeshLambertMaterial({
                         trasparent: true,
                         opacity: 0,
                         alphaTest: 0.2}), 
                     new THREE.MeshLambertMaterial({
                         trasparent: true,
                         opacity: 0,
                         alphaTest: 0.2}), 
                     new THREE.MeshLambertMaterial({
                         map: latoTextureBack}), 
                     new THREE.MeshLambertMaterial({
                         map: mattoniTexture}), 
                     new THREE.MeshLambertMaterial({
                         map: mattoniTexture}),
                     new THREE.MeshLambertMaterial({
                         map: mattoniTexture})
                    ];
    
    var latoDX = new THREE.Mesh(latoCamGeometry, latoMaterials);
    var latoSX = new THREE.Mesh(latoCamGeometry, latoMaterials);
    var latoBack = new THREE.Mesh(latoBackGeometry, latoMaterialsBack); 
    
    latoDX.position.set(cubeSize/2-spessoreCubo/2, baseSize, 0);
    latoSX.position.set(-cubeSize/2+spessoreCubo/2, baseSize, 0);
    latoBack.position.set(0,baseSize,-cubeSize/2+spessoreCubo/2);
    
    scene.add(latoDX);
    scene.add(latoSX);
    scene.add(latoBack);
    
    //STANZA//
    var stanzaGeometry = new THREE.PlaneGeometry(stanzaSize,stanzaSize);
    
    var pareteTexture = new THREE.TextureLoader().load( './images/parete.jpg');
    var pavimentoTexture = new THREE.TextureLoader().load( './images/pavimento.jpg');
    
    
    var stanzaMaterials = [new THREE.MeshLambertMaterial({side: THREE.DoubleSide,map: pareteTexture})];
    var pavimentoMaterials = [new THREE.MeshLambertMaterial({side: THREE.DoubleSide,map: pavimentoTexture})];

    var stanza = new THREE.Mesh(stanzaGeometry, pavimentoMaterials);
    stanza.rotateX(Math.PI/2);
    stanza.position.set(0,-cubeSize/2,stanzaSize/2-cubeSize/2);
    
    var pareteSX = new THREE.Mesh(stanzaGeometry, stanzaMaterials);
    var pareteDX = new THREE.Mesh(stanzaGeometry, stanzaMaterials);
    var pareteBack = new THREE.Mesh(stanzaGeometry, stanzaMaterials);
    
    pareteSX.rotateY(-Math.PI/2);
    pareteSX.position.set(-stanzaSize/2,0,-stanzaSize/2);
    pareteDX.rotateY(Math.PI/2);
    pareteDX.position.set(stanzaSize/2,0,-stanzaSize/2);
    pareteBack.rotateX(Math.PI/2);
    pareteBack.position.set(0,-stanzaSize/2,-stanzaSize/2);
    
    stanza.add(pareteBack);
    stanza.add(pareteSX);
    stanza.add(pareteDX);
    
    //LEGNO//
    
    var legnoGeometry = new THREE.CylinderGeometry(legnoRadius,legnoRadius,legnoHeight,legnoSegments);
    
    var legnoTexture = [new THREE.TextureLoader().load( './images/corteccia.png'),
                        new THREE.TextureLoader().load( './images/legnoBottom.png'),
                        new THREE.TextureLoader().load( './images/legnoBottom.png')];
    
    var legnoMaterial = [new THREE.MeshLambertMaterial({map: legnoTexture[0]}),
                         new THREE.MeshLambertMaterial({map: legnoTexture[1]}),
                         new THREE.MeshLambertMaterial({map: legnoTexture[2]})
                        ];
    
    var legno = new THREE.Mesh(legnoGeometry, legnoMaterial);
    legno.rotateX(Math.PI/2);
    legno.rotateZ(Math.PI/2);
    legno.position.set(0, legnoRadius, 0);

    var legno2 = new THREE.Mesh(legnoGeometry, legnoMaterial);
    legno2.rotateX(Math.PI/2);
    legno2.rotateZ(Math.PI/4);
    legno2.position.set(0, legnoRadius, 0);
    
    var legno3 = new THREE.Mesh(legnoGeometry, legnoMaterial);
    legno3.rotateX(Math.PI/2);
    legno3.rotateZ(-Math.PI/4);
    legno3.position.set(0, legnoRadius, 0);
    
    scene.add(legno);
    scene.add(legno2);
    scene.add(legno3);
    
    //FIAMMA//
    
    var flameGeometry = new THREE.BufferGeometry();
    var flameData = createFlame(numFlameParticles);
    
    flameGeometry.addAttribute('position', new THREE.BufferAttribute(flameData.positions, 3));
    flameGeometry.addAttribute('direction', new THREE.BufferAttribute(flameData.direction, 3));
    flameGeometry.addAttribute('uniqueness', new THREE.BufferAttribute(flameData.uniqueness, 1));
    flameGeometry.addAttribute('duration', new THREE.BufferAttribute(flameData.durations, 1));
    flameGeometry.addAttribute('particleOffset', new THREE.BufferAttribute(flameData.particleOS, 1));
    
    var flameVertexShader = document.getElementById('vertex_flame').textContent;
    var flameFragmentShader = document.getElementById('fragment_flame').textContent;
    
    uniforms_flame = {
        t: {type: 'f', value: 0.0},
        texture: {type: "t", value: new THREE.TextureLoader().load('./images/circle3.png')},
        sparkStartSize: { type: 'f', value:  10},
        sparkEndSize: { type: 'f', value: 20},
        sparkDistanceScale: { type: 'f', value:1.4},
        flameMinHeight: { type: 'f', value:0.02},
        flameMaxHeight: { type: 'f', value:0.2},
        color: { type: 'c', value:  new THREE.Color(0x6e4d00)}, 
        endColor: { type: 'c', value:  new THREE.Color(0x8E8A8C)}, 
        opacity: { type: 'f', value: 0.4},
        speed:{ type: 'f', value:  0.5}
    };
     
    var flameMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms_flame,
        vertexShader: flameVertexShader,
        fragmentShader: flameFragmentShader,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        trasparent: true,
        });
    var flame = new THREE.Points(flameGeometry, flameMaterial);

///////////////////////SMOKE
    var smokeGeometry = new THREE.BufferGeometry();
    smokeData = createSmoke(numSmokeParticles);
    
    smokeGeometry.addAttribute('position', new THREE.BufferAttribute(smokeData.positions, 3));
    smokeGeometry.addAttribute('direction', new THREE.BufferAttribute(smokeData.direction, 3));
    smokeGeometry.addAttribute('uniqueness', new THREE.BufferAttribute(smokeData.uniqueness, 1));
    smokeGeometry.addAttribute('duration', new THREE.BufferAttribute(smokeData.durations, 1));
    smokeGeometry.addAttribute('particleOffset', new THREE.BufferAttribute(smokeData.particleOS, 1));
    
    var smokeVertexShader = document.getElementById('vertex_smoke').textContent;
    var smokeFragmentShader = document.getElementById('fragment_smoke').textContent;
    
    uniforms_smoke = {
        t: {type: 'f', value: 0.0},
        texture: {type: "t", value: new THREE.TextureLoader().load('./images/smokeparticle2.png')},
        sparkStartSize: { type: 'f', value:  10},
        sparkEndSize: { type: 'f', value: 20},
        sparkDistanceScale: { type: 'f', value:1.4},
        flameMinHeight: { type: 'f', value:0.1},
        flameMaxHeight: { type: 'f', value:0.4},
        startColor: { type: 'c', value:  new THREE.Color(0xC0C0C0)}, 
        endColor: { type: 'c', value:  new THREE.Color(0x000000)}, 
        opacity: { type: 'f', value: 0.4},
        speed:{ type: 'f', value:  0.8},
    };
     
    var smokeMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms_smoke,
        vertexShader: smokeVertexShader,
        fragmentShader: smokeFragmentShader,
        blending: THREE.CustomBlending,
        depthWrite: false,
        trasparent: true
        });
    
    var smoke = new THREE.Points(smokeGeometry, smokeMaterial);
    smoke.sortParticles = true; 
    
    var gui = new dat.GUI();
    
    var flameFolder = gui.addFolder('Flame');
    var smokeFolder = gui.addFolder('Smoke');
    
    var guiVars = new function(){
        this.flameSpeed = 0.5;
        this.flameWidth = 0.2;
        this.numPart = numFlameParticles;
        this.opacity = 0.4;
    };
    
    var guiVarsSmoke = new function(){
        this.numPartSmoke = numSmokeParticles;
        this.opacity = 0.4;
    };
    
    
    flameFolder.add(guiVars, 'flameWidth', 0, 1).onFinishChange(function(newValue){
        uniforms_flame.flameMaxHeight.value = newValue;
        uniforms_flame.flameMinHeight.value = newValue - 0.18;
        light.intensity = newValue + uniforms_flame.speed.value + 1.0;
        ambientLight.intensity = 0.35;
        
        if(uniforms_flame.flameMinHeight.value < 0){
            uniforms_flame.flameMinHeight.value = 0;  
        }
        if(uniforms_flame.speed.value<=0.01 && newValue<=0.01){
            light.intensity = 0.0;
            ambientLight.intensity = 0.0;
        }
        
        if(uniforms_flame.speed.value < 0.3){
            baseWidth = 0.15;
            uniforms_smoke.opacity.value = 0.6;
        }else{
            baseWidth = uniforms_flame.speed.value*uniforms_flame.flameMinHeight.value;
            uniforms_smoke.opacity.value = 0.1;
             if(baseWidth>0.4){
                baseWidth = 0.3;
            }
        }
        
        for (var i = 0; i < numSmokeParticles; i ++) {
            var vAngle = Math.random()*Math.PI*2;
            smokeData.positions[i*3] = baseWidth*Math.random()*Math.cos(vAngle);
            smokeData.positions[i*3+1] = Math.random() + (uniforms_flame.speed.value + uniforms_flame.flameMinHeight.value);
            smokeData.positions[i*3+2] = baseWidth*Math.random()*Math.sin(vAngle);
        }

        smokeGeometry.attributes.position.needsUpdate = true;
    });
    flameFolder.add(guiVars, 'flameSpeed', 0, 1).onFinishChange(function(newValue){
        uniforms_flame.speed.value = newValue;
        light.intensity = newValue + uniforms_flame.flameMaxHeight.value + 1.0;
        ambientLight.intensity = 0.35;
        
        if(newValue < 0.3){
            baseWidth = 0.15;
            uniforms_smoke.opacity.value = 0.6;
            //light.intensity = newValue + uniforms_flame.flameMinHeight.value;
        }else{
            baseWidth = newValue*uniforms_flame.flameMinHeight.value;
             uniforms_smoke.opacity.value = 0.1;
            if(baseWidth>0.4){
                baseWidth = 0.3;
            }
        }
        
        if(uniforms_flame.flameMaxHeight.value<=0.01 && newValue<=0.01){
            light.intensity = 0.0;
            ambientLight.intensity = 0.0;
        }

        for (var i = 0; i < numSmokeParticles; i ++) {
            var vAngle = Math.random()*Math.PI*2;
            smokeData.positions[i*3] = baseWidth*Math.random()*Math.cos(vAngle);
            smokeData.positions[i*3+1] = Math.random() + (newValue + uniforms_flame.flameMinHeight.value);
            smokeData.positions[i*3+2] = baseWidth*Math.random()*Math.sin(vAngle);
        }
        smokeGeometry.attributes.position.needsUpdate = true;
    });
    
    flameFolder.add(guiVars, 'opacity', 0, 1).onFinishChange(function(newValue){
        uniforms_flame.opacity.value = newValue;
    });
    
    flameFolder.add(guiVars, 'numPart', 100, 10000).onFinishChange(function(newValue){
        
        numFlameParticles = newValue;
        
        flameGeometry.removeAttribute('position');
        flameGeometry.removeAttribute('direction');
        flameGeometry.removeAttribute('uniqueness');
        flameGeometry.removeAttribute('duration');
        flameGeometry.removeAttribute('particleOffset');
        
        var newData = createFlame(newValue);
        
        flameGeometry.addAttribute('position', new THREE.BufferAttribute(newData.positions, 3));
        flameGeometry.addAttribute('direction', new THREE.BufferAttribute(newData.direction, 3));
        flameGeometry.addAttribute('uniqueness', new THREE.BufferAttribute(newData.uniqueness, 1));
        flameGeometry.addAttribute('duration', new THREE.BufferAttribute(newData.durations, 1));
        flameGeometry.addAttribute('particleOffset', new THREE.BufferAttribute(newData.particleOS, 1));
        
        flameGeometry.attributes.position.needsUpdate = true;
        flameGeometry.attributes.direction.needsUpdate = true;
        flameGeometry.attributes.uniqueness.needsUpdate = true;
        flameGeometry.attributes.duration.needsUpdate = true;
        flameGeometry.attributes.particleOffset.needsUpdate = true;
    });
    
    smokeFolder.add(guiVarsSmoke, 'numPartSmoke', 100, 10000).onFinishChange(function(newValue){
        
        numSmokeParticles = newValue;
        
        smokeGeometry.removeAttribute('position');
        smokeGeometry.removeAttribute('direction');
        smokeGeometry.removeAttribute('uniqueness');
        smokeGeometry.removeAttribute('duration');
        smokeGeometry.removeAttribute('particleOffset');
        
        smokeData = createSmoke(newValue);
        
        smokeGeometry.addAttribute('position', new THREE.BufferAttribute(smokeData.positions, 3));
        smokeGeometry.addAttribute('direction', new THREE.BufferAttribute(smokeData.direction, 3));
        smokeGeometry.addAttribute('uniqueness', new THREE.BufferAttribute(smokeData.uniqueness, 1));
        smokeGeometry.addAttribute('duration', new THREE.BufferAttribute(smokeData.durations, 1));
        smokeGeometry.addAttribute('particleOffset', new THREE.BufferAttribute(smokeData.particleOS, 1));
        
        smokeGeometry.attributes.position.needsUpdate = true;
        smokeGeometry.attributes.direction.needsUpdate = true;
        smokeGeometry.attributes.uniqueness.needsUpdate = true;
        smokeGeometry.attributes.duration.needsUpdate = true;
        smokeGeometry.attributes.particleOffset.needsUpdate = true;
    });
    
    smokeFolder.add(guiVarsSmoke, 'opacity', 0, 1).onFinishChange(function(newValue){
        uniforms_smoke.opacity.value = newValue;
    });
    
    scene.add(flame);
    scene.add(smoke);
    scene.add(base);    
    scene.add(stanza);
    
}

function animate() {
    var elapsed = clock.getElapsedTime();
    window.requestAnimationFrame(animate);
    uniforms_flame.t.value = elapsed;
    uniforms_smoke.t.value = elapsed;
    controls.update();
    renderer.render(scene, camera);
}

var clock = new THREE.Clock();
init();
animate();