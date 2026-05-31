document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // --- loader: Grid Shutter creation & animation ---
  const loaderGrid = document.getElementById('loader-grid');
  const rows = 4;
  const cols = 12;

  // Build the grids of blocks
  for (let r = 0; r < rows; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'loader-row';
    for (let c = 0; c < cols; c++) {
      const block = document.createElement('div');
      block.className = 'loader-block';
      rowDiv.appendChild(block);
    }
    loaderGrid.appendChild(rowDiv);
  }

  // GSAP Loader Animation
  const loaderTl = gsap.timeline({
    onComplete: () => {
      document.querySelector('.page-loader').style.display = 'none';
      initScrollTriggerAnimations();
    }
  });

  loaderTl
    .to('#loader-logo', {
      scale: 1.1,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.inOut',
      delay: 0.8
    });

  const rowBlocks = document.querySelectorAll('.loader-row');
  rowBlocks.forEach((row, index) => {
    const blocks = row.querySelectorAll('.loader-block');
    const isEven = index % 2 === 0;
    loaderTl.to(blocks, {
      scaleX: 0,
      transformOrigin: isEven ? 'left center' : 'right center',
      duration: 0.8,
      ease: 'power2.inOut',
      stagger: {
        amount: 0.4,
        from: isEven ? 'end' : 'start'
      }
    }, '-=0.8');
  });

  // --- Three.js 3D Neural Network Background ---
  const canvas = document.getElementById('webgl-canvas');
  let scene, camera, renderer;
  let particles, particlePositions, linesMesh;
  const particleCount = 120;
  const maxDistance = 110;
  const rWidth = window.innerWidth;
  const rHeight = window.innerHeight;

  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function initThree() {
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 400;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Particle geometry
    const geometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    const minBound = -250;
    const maxBound = 250;

    for (let i = 0; i < particleCount; i++) {
      // Random coordinates inside a bounding box
      const x = Math.random() * (maxBound - minBound) + minBound;
      const y = Math.random() * (maxBound - minBound) + minBound;
      const z = Math.random() * (maxBound - minBound) + minBound;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // Random speed directions
      particleSpeeds.push({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Particle texture / material (Custom Glowing Point)
    const pMaterial = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 3,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8
    });

    particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);

    // Connective Lines Mesh initialization
    const lineIndices = [];
    const lineGeometry = new THREE.BufferGeometry();
    
    // We will update positions array for lines dynamically inside rendering loop
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8a2be2,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

    // Dynamic animation loop
    function animate() {
      requestAnimationFrame(animate);

      // Smooth mouse parallax drift for camera
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      
      camera.position.x = mouse.x * 120;
      camera.position.y = mouse.y * 120;
      camera.lookAt(scene.position);

      const positions = particles.geometry.attributes.position.array;

      // Update positions based on speeds
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += particleSpeeds[i].x;
        positions[i * 3 + 1] += particleSpeeds[i].y;
        positions[i * 3 + 2] += particleSpeeds[i].z;

        // Bouncing boundaries
        if (positions[i * 3] < minBound || positions[i * 3] > maxBound) particleSpeeds[i].x *= -1;
        if (positions[i * 3 + 1] < minBound || positions[i * 3 + 1] > maxBound) particleSpeeds[i].y *= -1;
        if (positions[i * 3 + 2] < minBound || positions[i * 3 + 2] > maxBound) particleSpeeds[i].z *= -1;
      }

      particles.geometry.attributes.position.needsUpdate = true;
      linesMesh.geometry.attributes.position.needsUpdate = true;

      // Render scene
      renderer.render(scene, camera);
    }

    animate();
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Track Mouse movement for 3D Camera drift
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) - 0.5;
    mouse.targetY = -(e.clientY / window.innerHeight) + 0.5;
  });

  initThree();

  // --- GSAP ScrollTrigger reveals ---
  function initScrollTriggerAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero timeline entry
    const heroTl = gsap.timeline();
    heroTl.from('.navbar', {
      y: -80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    })
    .from('.hero-subtitle', {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, '-=0.5')
    .from('.hero-title span', {
      y: 40,
      opacity: 0,
      stagger: 0.1,
      duration: 1,
      ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-desc', {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, '-=0.7')
    .from('.meta-item', {
      scale: 0.9,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.6')
    .from('.btn-primary', {
      y: 20,
      opacity: 0,
      duration: 0.6
    }, '-=0.5');

    // Section triggers for reveal animations
    const revealElements = document.querySelectorAll('[data-animate="fade-up"]');
    revealElements.forEach((el) => {
      if (el.closest('#hero')) return; // Ignore hero elements as they run on page load
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Timeline item reveal animations (slide from sides)
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, idx) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%'
        },
        x: idx % 2 === 0 ? -60 : 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out'
      });
    });

    // Navigation Active Link Highlighting on Scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - sectionHeight / 3) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }
});
