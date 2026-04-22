document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight / 5 * 4;
        
        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Smooth Scrolling for Nav Links
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetEl = document.querySelector(targetId);
                
                if (targetEl) {
                    window.scrollTo({
                        top: targetEl.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Play button interaction (dummy)
    const playBtn = document.querySelector('.play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            alert('Video playing... (In a real app, this would open a modal or play the video)');
        });
    }

    // Navbar scroll effect
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.padding = '0.75rem 0';
            nav.style.background = 'rgba(13, 11, 10, 0.95)';
        } else {
            nav.style.padding = '1.25rem 0';
            nav.style.background = 'rgba(13, 11, 10, 0.8)';
        }
    });

    // Parallax Scroll for Video Cards
    const videoCards = document.querySelectorAll('.video-card');
    window.addEventListener('scroll', () => {
        videoCards.forEach(card => {
            const speed = card.getAttribute('data-speed') || 0;
            // Move up as you scroll down
            const yPos = -(window.scrollY * speed);
            card.style.setProperty('--scroll-y', `${yPos}px`);
        });
    });

    // 3D Globe Implementation
    const initGlobe = () => {
        const container = document.getElementById('globe-canvas');
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Earth Group
        const earthGroup = new THREE.Group();
        scene.add(earthGroup);

        // Earth
        const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
        const textureLoader = new THREE.TextureLoader();
        
        // High quality textures
        const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-dark.jpg');
        const bumpMap = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-topology.png');
        
        const earthMaterial = new THREE.MeshStandardMaterial({
            map: earthTexture,
            bumpMap: bumpMap,
            bumpScale: 0.2,
            roughness: 0.7,
            metalness: 0.2,
            color: 0x444444 // Fallback color if texture fails
        });

        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earthGroup.add(earth);

        // City Lights (Detail)
        const cityLightsTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg');
        const cityLightsMaterial = new THREE.MeshBasicMaterial({
            map: cityLightsTexture,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.8
        });
        const cityLights = new THREE.Mesh(earthGeometry, cityLightsMaterial);
        earthGroup.add(cityLights);

        // Grid (Detail)
        const gridGeometry = new THREE.SphereGeometry(5.05, 64, 64);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0xE87C41,
            wireframe: true,
            transparent: true,
            opacity: 0.05
        });
        const grid = new THREE.Mesh(gridGeometry, gridMaterial);
        earthGroup.add(grid);

        // Atmosphere Glow
        const atmosGeometry = new THREE.SphereGeometry(6, 64, 64);
        const atmosMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.91, 0.49, 0.25, 1.0) * intensity;
                }
            `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
        scene.add(atmosphere);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0xE87C41, 2);
        pointLight1.position.set(20, 10, 20);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x3b82f6, 1);
        pointLight2.position.set(-20, -10, -20);
        scene.add(pointLight2);

        // Starfield
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
        const starVertices = [];
        for (let i = 0; i < 5000; i++) {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = (Math.random() - 0.5) * 1000;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);

        camera.position.z = 15;

        // Controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            earthGroup.rotation.y += 0.001; // Extra rotation for group
            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    };

    initGlobe();
});
