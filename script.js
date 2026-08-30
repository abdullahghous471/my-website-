// === THREE.JS 3D BACKGROUND ===
let scene, camera, renderer;
let particles = [];
let boxes = [];

function initThreeJS() {
    // Setup
    const canvas = document.getElementById('canvas');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create Particles
    createParticleField();
    createAnimatedBoxes();

    // Animation Loop
    animate();

    // Handle Resize
    window.addEventListener('resize', onWindowResize);
}

function createParticleField() {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 200;      // x
        positions[i + 1] = (Math.random() - 0.5) * 200;  // y
        positions[i + 2] = (Math.random() - 0.5) * 200;  // z
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0x00d9ff,
        size: 0.7,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    particles.push({
        mesh: particleSystem,
        speed: 0.02,
        originalPositions: positions.slice()
    });
}

function createAnimatedBoxes() {
    const boxGeometries = [
        new THREE.BoxGeometry(15, 15, 15),
        new THREE.BoxGeometry(10, 10, 10),
        new THREE.BoxGeometry(20, 20, 20)
    ];

    const positions = [
        { x: -50, y: 20, z: -100 },
        { x: 40, y: -30, z: -80 },
        { x: 0, y: 40, z: -120 }
    ];

    boxGeometries.forEach((geometry, index) => {
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.6 + index * 0.1, 0.7, 0.6),
            transparent: true,
            opacity: 0.3,
            wireframe: false
        });

        const box = new THREE.Mesh(geometry, material);
        box.position.set(positions[index].x, positions[index].y, positions[index].z);
        box.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );

        scene.add(box);

        boxes.push({
            mesh: box,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.005,
                y: (Math.random() - 0.5) * 0.005,
                z: (Math.random() - 0.5) * 0.005
            }
        });
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Animate particles
    particles.forEach(p => {
        const positions = p.mesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += (Math.random() - 0.5) * p.speed;
            positions[i + 1] += (Math.random() - 0.5) * p.speed;
            positions[i + 2] += (Math.random() - 0.5) * p.speed;

            // Wrap around
            if (Math.abs(positions[i]) > 100) positions[i] *= -0.9;
            if (Math.abs(positions[i + 1]) > 100) positions[i + 1] *= -0.9;
            if (Math.abs(positions[i + 2]) > 100) positions[i + 2] *= -0.9;
        }
        p.mesh.geometry.attributes.position.needsUpdate = true;
    });

    // Animate boxes
    boxes.forEach(box => {
        box.mesh.rotation.x += box.rotationSpeed.x;
        box.mesh.rotation.y += box.rotationSpeed.y;
        box.mesh.rotation.z += box.rotationSpeed.z;
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// === SMOOTH SCROLL & INTERACTIONS ===
function initInteractions() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Add scroll animations
    observeElements();
}

function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section > .container, .hero-content, .service-card, .project-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function () {
    initThreeJS();
    initInteractions();

    // Add some polish: update active nav link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
});

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            const sectionId = section.getAttribute('id');
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

// Parallax effect on mouse move
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    boxes.forEach((box, index) => {
        const speed = (index + 1) * 0.01;
        box.mesh.position.x += (x - 0.5) * speed;
        box.mesh.position.y += (y - 0.5) * speed;
    });
});
