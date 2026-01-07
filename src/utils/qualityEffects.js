// QMS质量管理系统 - 质量检测特效工具
// 浙江腾腾电气专用质量管理动画效果

export class QualityEffects {
  constructor() {
    this.effects = new Map();
    this.animationFrameId = null;
    this.isRunning = false;
  }

  // 初始化质量检测特效
  init() {
    this.createQualityParticles();
    this.startQualityAnimation();
    this.bindEvents();
  }

  // 创建质量检测粒子效果
  createQualityParticles() {
    const containers = document.querySelectorAll('.quality-particle-container');
    
    containers.forEach(container => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1';
      
      container.appendChild(canvas);
      
      const particles = this.generateQualityParticles(canvas.width, canvas.height);
      
      this.effects.set(container, {
        canvas,
        ctx,
        particles,
        type: 'quality-particles'
      });
    });
  }

  // 生成质量检测粒子
  generateQualityParticles(width, height) {
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.getQualityColor(),
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01
      });
    }
    
    return particles;
  }

  // 获取质量状态颜色
  getQualityColor() {
    const colors = [
      'rgba(24, 144, 255, 0.6)',   // 质量蓝
      'rgba(82, 196, 26, 0.6)',    // 优秀绿
      'rgba(114, 46, 209, 0.6)',   // 紫色
      'rgba(19, 194, 194, 0.6)'    // 青色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // 启动质量动画
  startQualityAnimation() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  // 动画循环
  animate() {
    this.effects.forEach((effect, container) => {
      if (effect.type === 'quality-particles') {
        this.updateQualityParticles(effect);
        this.renderQualityParticles(effect);
      }
    });
    
    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
  }

  // 更新质量粒子
  updateQualityParticles(effect) {
    const { particles, canvas } = effect;
    
    particles.forEach(particle => {
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 边界检测
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -1;
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -1;
      }
      
      // 更新脉冲效果
      particle.pulse += particle.pulseSpeed;
      particle.opacity = 0.3 + Math.sin(particle.pulse) * 0.3;
    });
  }

  // 渲染质量粒子
  renderQualityParticles(effect) {
    const { ctx, particles, canvas } = effect;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // 绘制连接线
    this.drawQualityConnections(effect);
  }

  // 绘制质量检测连接线
  drawQualityConnections(effect) {
    const { ctx, particles } = effect;
    const maxDistance = 100;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.2;
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.strokeStyle = 'rgba(24, 144, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // 创建质量检测波纹效果
  createQualityRipple(element, x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'quality-ripple';
    ripple.style.cssText = `
      position: absolute;
      left: ${x - 25}px;
      top: ${y - 25}px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(24, 144, 255, 0.3) 0%, transparent 70%);
      pointer-events: none;
      animation: qualityRippleEffect 1s ease-out forwards;
      z-index: 1000;
    `;
    
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 1000);
  }

  // 创建质量状态指示器动画
  animateQualityStatus(element, status) {
    const colors = {
      excellent: '#52c41a',
      good: '#1890ff',
      warning: '#faad14',
      critical: '#f5222d',
      pending: '#d9d9d9'
    };
    
    const color = colors[status] || colors.good;
    
    element.style.animation = 'none';
    element.offsetHeight; // 触发重排
    element.style.animation = `qualityStatusPulse 2s ease-in-out infinite`;
    element.style.setProperty('--status-color', color);
  }

  // 创建质量流程动画
  animateQualityFlow(container) {
    const steps = container.querySelectorAll('.quality-step');
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        step.classList.add('quality-flow-active');
        
        // 创建流动效果
        const flowLine = document.createElement('div');
        flowLine.className = 'quality-flow-line';
        flowLine.style.cssText = `
          position: absolute;
          top: 50%;
          left: 100%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #1890ff, transparent);
          animation: qualityFlowLine 1s ease-out forwards;
          z-index: 2;
        `;
        
        if (index < steps.length - 1) {
          step.appendChild(flowLine);
          
          setTimeout(() => {
            if (flowLine.parentNode) {
              flowLine.parentNode.removeChild(flowLine);
            }
          }, 1000);
        }
      }, index * 300);
    });
  }

  // 创建质量数据可视化动画
  animateQualityChart(chartContainer) {
    const elements = chartContainer.querySelectorAll('.chart-element');
    
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.6s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  // 绑定事件
  bindEvents() {
    // 质量检测点击效果
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quality-interactive')) {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.createQualityRipple(e.target, x, y);
      }
    });
    
    // 质量状态变化监听
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-quality-status') {
          const element = mutation.target;
          const status = element.getAttribute('data-quality-status');
          this.animateQualityStatus(element, status);
        }
      });
    });
    
    document.querySelectorAll('.quality-status').forEach(element => {
      observer.observe(element, { attributes: true });
    });
  }

  // 停止动画
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  // 清理资源
  destroy() {
    this.stop();
    this.effects.forEach((effect) => {
      if (effect.canvas && effect.canvas.parentNode) {
        effect.canvas.parentNode.removeChild(effect.canvas);
      }
    });
    this.effects.clear();
  }

  // 添加质量检测动画样式
  addQualityStyles() {
    if (document.getElementById('quality-effects-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'quality-effects-styles';
    style.textContent = `
      @keyframes qualityRippleEffect {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      @keyframes qualityStatusPulse {
        0%, 100% {
          box-shadow: 0 0 0 0 var(--status-color, #1890ff);
        }
        50% {
          box-shadow: 0 0 0 10px transparent;
        }
      }
      
      @keyframes qualityFlowLine {
        0% {
          width: 0;
          opacity: 0;
        }
        50% {
          opacity: 1;
        }
        100% {
          width: 100%;
          opacity: 0;
        }
      }
      
      .quality-flow-active {
        animation: qualityGlow 2s ease-in-out infinite;
      }
      
      .quality-interactive {
        position: relative;
        overflow: hidden;
      }
    `;
    
    document.head.appendChild(style);
  }
}

// 创建全局质量特效实例
export const qualityEffects = new QualityEffects();

// 自动初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    qualityEffects.addQualityStyles();
    qualityEffects.init();
  });
}
