window.onload = () => {
  let canvas = document.getElementById('canvas-particles');
  let context = canvas.getContext('2d');

  let particles = [];
  let max_particles = 100; 
  let angle = 0;

  const MAX_PARTICLE_SIZE = 5;
  const MIN_PARTICLE_SIZE = 2;

  function setCanvasSize() {
      // Make it visually fill the positioned parent
      canvas.style.width ='100%';
      canvas.style.height='100%';
      
      // ...then set the internal size to match
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
  }

  function populate(){  
    for (let i = 0; i < max_particles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * MAX_PARTICLE_SIZE + MIN_PARTICLE_SIZE,
        density: Math.random() + 1
      });
    }  
  }

  function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'pink';
    context.beginPath();

    particles.forEach(particle => {
      context.moveTo(particle.x, particle.y);
      context.arc(particle.x, particle.y, particle.radius, Math.PI * 2, true);
    }, this);

    context.fill();
    animate();
 }

  function animate() { 
    angle += 0.007;

    particles.map(particle => {
      // update position of each particle
      particle.y += Math.pow(particle.density, 2) + 1;
      particle.x += Math.sin(angle) * 2;

      // if the particle reaches the bottom, respawn at the top
      if (particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width;
          particle.y = 0;
      }
      return particle;
    });
  }

  // EVENT LISTENERS
  window.onresize = () => setCanvasSize();

  // EXECUTION
  setCanvasSize();
  populate();
  setInterval(draw, 1000/60);
}