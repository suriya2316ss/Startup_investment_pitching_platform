/**
 * Startup Investment Pitching Platform
 * 3D Animations using Three.js
 */

// Background Animation
class BackgroundAnimation {
    constructor() {
        this.canvas = document.getElementById('animation-bg');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.particles = [];
        this.particlesCount = 100;

        this.setup();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }

    setup() {
        this.camera.position.z = 30;
        this.mouseX = 0;
        this.mouseY = 0;

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add point light
        const pointLight = new THREE.PointLight(0x4f46e5, 1);
        pointLight.position.set(0, 10, 20);
        this.scene.add(pointLight);
    }

    createParticles() {
        const particleGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0x4f46e5,
            emissive: 0x4f46e5,
            emissiveIntensity: 0.5,
            specular: 0xffffff,
            shininess: 20
        });

        for (let i = 0; i < this.particlesCount; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);

            // Random position within a sphere
            const radius = 25 + Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
            particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
            particle.position.z = radius * Math.cos(phi);

            // Random size
            const scale = Math.random() * 1.5 + 0.5;
            particle.scale.set(scale, scale, scale);

            // Add custom properties for animation
            particle.userData = {
                speed: Math.random() * 0.01 + 0.005,
                rotateSpeed: Math.random() * 0.01 + 0.005,
                originalX: particle.position.x,
                originalY: particle.position.y,
                originalZ: particle.position.z,
                amplitude: Math.random() * 0.5 + 0.2
            };

            this.particles.push(particle);
            this.scene.add(particle);
        }

        // Add connecting lines
        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x4f46e5,
            transparent: true,
            opacity: 0.2
        });

        this.lineGeometries = [];
        this.lines = [];
    }

    updateConnections() {
        // Clear existing lines
        for (const line of this.lines) {
            this.scene.remove(line);
        }
        this.lines = [];

        // Find particles that are close to each other and connect them
        const maxDistance = 8;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particleA = this.particles[i];
                const particleB = this.particles[j];

                const distance = particleA.position.distanceTo(particleB.position);

                if (distance < maxDistance) {
                    const opacity = 1 - (distance / maxDistance);

                    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                        particleA.position,
                        particleB.position
                    ]);

                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x4f46e5,
                        transparent: true,
                        opacity: opacity * 0.2
                    });

                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    this.scene.add(line);
                    this.lines.push(line);
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // Rotate particles
        const time = Date.now() * 0.001;

        for (const particle of this.particles) {
            const userData = particle.userData;

            // Apply oscillating motion
            particle.position.x = userData.originalX + Math.sin(time * userData.speed) * userData.amplitude;
            particle.position.y = userData.originalY + Math.cos(time * userData.speed) * userData.amplitude;
            particle.position.z = userData.originalZ + Math.sin(time * userData.speed * 0.5) * userData.amplitude;

            // Rotate particle
            particle.rotation.x += userData.rotateSpeed;
            particle.rotation.y += userData.rotateSpeed;
        }

        // Update mouse interaction
        this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouseY - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        // Update connections every few frames to improve performance
        if (Math.random() < 0.05) {
            this.updateConnections();
        }

        this.renderer.render(this.scene, this.camera);
    }

    addEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    handleMouseMove(event) {
        this.mouseX = (event.clientX - window.innerWidth / 2) * 0.01;
        this.mouseY = (event.clientY - window.innerHeight / 2) * 0.01;
    }
}

// Hero 3D Model Animation
class HeroModelAnimation {
    constructor() {
        this.container = document.getElementById('hero-model-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        this.setup();
        this.createRocketModel();
        this.addEventListeners();
        this.animate();
    }

    setup() {
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x4f46e5, 1, 20);
        pointLight.position.set(0, 5, 5);
        this.scene.add(pointLight);

        // Create base platform
        const platformGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 32);
        const platformMaterial = new THREE.MeshPhongMaterial({
            color: 0xf3f4f6,
            shininess: 10
        });
        this.platform = new THREE.Mesh(platformGeometry, platformMaterial);
        this.platform.position.y = -3;
        this.platform.receiveShadow = true;
        this.scene.add(this.platform);
    }

    createRocketModel() {
        // Create a stylized rocket
        this.rocket = new THREE.Group();

        // Rocket body
        const bodyGeometry = new THREE.CylinderGeometry(1, 1, 6, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 50
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        this.rocket.add(body);

        // Rocket nose
        const noseGeometry = new THREE.ConeGeometry(1, 2, 16);
        const noseMaterial = new THREE.MeshPhongMaterial({
            color: 0xf97316,
            shininess: 50
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.y = 4;
        nose.castShadow = true;
        this.rocket.add(nose);

        // Rocket fins
        const finGeometry = new THREE.BoxGeometry(0.5, 2, 1.5);
        const finMaterial = new THREE.MeshPhongMaterial({
            color: 0x4f46e5,
            shininess: 50
        });

        for (let i = 0; i < 4; i++) {
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            fin.position.y = -2.5;
            fin.rotation.y = Math.PI / 2 * i;
            fin.position.x = Math.sin(Math.PI / 2 * i) * 1.2;
            fin.position.z = Math.cos(Math.PI / 2 * i) * 1.2;
            fin.castShadow = true;
            this.rocket.add(fin);
        }

        // Rocket windows
        const windowGeometry = new THREE.CircleGeometry(0.3, 16);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x90cdf4,
            shininess: 90,
            emissive: 0x90cdf4,
            emissiveIntensity: 0.2
        });

        for (let i = 0; i < 3; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.y = i - 1;
            window.position.z = 0.99;
            window.rotation.x = Math.PI / 2;
            this.rocket.add(window);
        }

        // Rocket exhaust
        const exhaustGeometry = new THREE.ConeGeometry(1, 2, 16);
        const exhaustMaterial = new THREE.MeshPhongMaterial({
            color: 0xf97316,
            emissive: 0xf97316,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.8
        });
        this.exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        this.exhaust.position.y = -4;
        this.exhaust.rotation.x = Math.PI;
        this.rocket.add(this.exhaust);

        // Rocket particles
        this.particles = [];
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshPhongMaterial({
            color: 0xf97316,
            emissive: 0xf97316,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 0.8;

            particle.position.x = Math.cos(angle) * radius;
            particle.position.z = Math.sin(angle) * radius;
            particle.position.y = -4 - Math.random() * 2;
            particle.scale.set(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5
            );

            particle.userData = {
                originalY: particle.position.y,
                speed: Math.random() * 0.05 + 0.02
            };

            this.particles.push(particle);
            this.rocket.add(particle);
        }

        // Add the rocket to the scene
        this.rocket.position.y = 0;
        this.rocket.castShadow = true;
        this.scene.add(this.rocket);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        const time = Date.now() * 0.001;

        // Float the rocket up and down
        this.rocket.position.y = Math.sin(time * 0.5) * 0.5;
        this.rocket.rotation.y = time * 0.2;

        // Animate the exhaust
        this.exhaust.scale.set(
            1 + Math.sin(time * 5) * 0.05,
            1 + Math.sin(time * 10) * 0.1,
            1 + Math.sin(time * 5) * 0.05
        );

        // Animate the particles
        for (const particle of this.particles) {
            particle.position.y -= particle.userData.speed;
            particle.material.opacity -= particle.userData.speed * 0.1;

            if (particle.position.y < particle.userData.originalY - 3 || particle.material.opacity <= 0) {
                particle.position.y = particle.userData.originalY;
                particle.material.opacity = 1;

                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 0.8;
                particle.position.x = Math.cos(angle) * radius;
                particle.position.z = Math.sin(angle) * radius;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    addEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Step Icons 3D Animations
class StepIconsAnimation {
    constructor() {
        this.setupIcons();
    }

    setupIcons() {
        this.createProfileIcon();
        this.createPitchIcon();
        this.createConnectionIcon();
        this.createFundingIcon();
    }

    createProfileIcon() {
        const container = document.getElementById('step1-icon');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4f46e5, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create profile icon (user silhouette)
        const group = new THREE.Group();

        // Head
        const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4f46e5,
            shininess: 80
        });
        const head = new THREE.Mesh(headGeometry, material);
        head.position.y = 0.5;
        group.add(head);

        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.7, 1, 1.5, 32);
        const body = new THREE.Mesh(bodyGeometry, material);
        body.position.y = -0.8;
        group.add(body);

        scene.add(group);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            const time = Date.now() * 0.001;
            group.rotation.y = Math.sin(time) * 0.5;

            renderer.render(scene, camera);
        }

        animate();
    }

    createPitchIcon() {
        const container = document.getElementById('step2-icon');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4f46e5, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create document icon
        const group = new THREE.Group();

        // Paper
        const paperGeometry = new THREE.BoxGeometry(2, 2.5, 0.1);
        const paperMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 30
        });
        const paper = new THREE.Mesh(paperGeometry, paperMaterial);
        group.add(paper);

        // Lines
        const lineMaterial = new THREE.MeshPhongMaterial({
            color: 0x4f46e5,
            shininess: 80
        });

        for (let i = 0; i < 4; i++) {
            const lineGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.15);
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.y = 0.8 - i * 0.5;
            group.add(line);
        }

        scene.add(group);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            const time = Date.now() * 0.001;
            group.rotation.y = Math.sin(time) * 0.3;
            group.position.y = Math.sin(time * 2) * 0.1;

            renderer.render(scene, camera);
        }

        animate();
    }

    createConnectionIcon() {
        const container = document.getElementById('step3-icon');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4f46e5, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create connection icon (two nodes connected)
        const group = new THREE.Group();

        // First node
        const nodeGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const nodeMaterial = new THREE.MeshPhongMaterial({
            color: 0x4f46e5,
            shininess: 80
        });
        const node1 = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node1.position.x = -1;
        group.add(node1);

        // Second node
        const node2 = new THREE.Mesh(nodeGeometry, nodeMaterial);
        node2.position.x = 1;
        group.add(node2);

        // Connection line
        const lineGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 16);
        const lineMaterial = new THREE.MeshPhongMaterial({
            color: 0xf97316,
            shininess: 80
        });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.rotation.z = Math.PI / 2;
        group.add(line);

        scene.add(group);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            const time = Date.now() * 0.001;
            group.rotation.y = Math.sin(time) * 0.5;
            node1.scale.set(
                1 + Math.sin(time * 2) * 0.1,
                1 + Math.sin(time * 2) * 0.1,
                1 + Math.sin(time * 2) * 0.1
            );
            node2.scale.set(
                1 + Math.sin(time * 2 + 1) * 0.1,
                1 + Math.sin(time * 2 + 1) * 0.1,
                1 + Math.sin(time * 2 + 1) * 0.1
            );

            renderer.render(scene, camera);
        }

        animate();
    }

    createFundingIcon() {
        const container = document.getElementById('step4-icon');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        camera.position.z = 5;

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x4f46e5, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // Create funding icon (coins/dollar)
        const group = new THREE.Group();

        // Dollar symbol
        const dollarGeometry = new THREE.TextGeometry('$', {
            // TextGeometry parameters would go here, but we'll use cylinder for simplicity
        });

        // Main coin
        const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
        const coinMaterial = new THREE.MeshPhongMaterial({
            color: 0xf97316,
            shininess: 80
        });
        const coin = new THREE.Mesh(coinGeometry, coinMaterial);
        coin.rotation.x = Math.PI / 2;
        group.add(coin);

        // Dollar sign on coin
        const dollarSignGeometry = new THREE.BoxGeometry(0.2, 0.8, 0.25);
        const dollarSignMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 80
        });
        const dollarSign = new THREE.Mesh(dollarSignGeometry, dollarSignMaterial);
        dollarSign.position.z = 0.15;
        group.add(dollarSign);

        // Dollar vertical line
        const dollarLineGeometry = new THREE.BoxGeometry(0.2, 1, 0.25);
        const dollarLine = new THREE.Mesh(dollarLineGeometry, dollarSignMaterial);
        dollarLine.position.z = 0.15;
        group.add(dollarLine);

        // Additional coins
        const smallCoinGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32);

        const coin2 = new THREE.Mesh(smallCoinGeometry, coinMaterial);
        coin2.rotation.x = Math.PI / 2;
        coin2.position.set(-0.5, -0.4, -0.5);
        group.add(coin2);

        const coin3 = new THREE.Mesh(smallCoinGeometry, coinMaterial);
        coin3.rotation.x = Math.PI / 2;
        coin3.position.set(0.5, -0.6, -0.7);
        group.add(coin3);

        scene.add(group);

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);

            const time = Date.now() * 0.001;
            group.rotation.y = Math.sin(time) * 0.5;
            group.rotation.x = Math.sin(time * 0.5) * 0.2;

            // Bouncing effect
            coin2.position.y = -0.4 + Math.sin(time * 3) * 0.1;
            coin3.position.y = -0.6 + Math.sin(time * 3 + 1) * 0.1;

            renderer.render(scene, camera);
        }

        animate();
    }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize background animation
    const backgroundAnimation = new BackgroundAnimation();

    // Initialize hero model animation
    const heroModelAnimation = new HeroModelAnimation();

    // Initialize step icons animations
    const stepIconsAnimation = new StepIconsAnimation();
});
