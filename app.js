/* ==========================================================================
   HUT RI KE-81 WEB UNDANGAN JAVASCRIPT
   Features: Autoplay Audio, Countdown, Fireworks, Global Google Sheets Guestbook & Quiz
   ========================================================================== */

const GOOGLE_SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7hl8TlARetoE8UcccyRfSkaDzeQA1thFYSqm58gmHuIxDNNMiE4-wTkxOFzT0AEtd/exec"; 


document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialization started...');

  // Elements
  const coverModal = document.getElementById('cover-modal');
  const mainContent = document.getElementById('main-content');
  const btnOpenInvitation = document.getElementById('btn-open-invitation');
  const bgMusic = document.getElementById('bg-music');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  let isPlaying = false;
  let audioContext = null;

  // ==========================================================================
  // 1. AUDIO & COVER OPEN HANDLER (AUTOPLAY POLICY COMPLIANCE)
  // ==========================================================================
  
  function playSynthAnthem() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContext = ctx;
      const notes = [
        { note: 392.00, duration: 0.4 }, // G4
        { note: 440.00, duration: 0.4 }, // A4
        { note: 493.88, duration: 0.4 }, // B4
        { note: 523.25, duration: 0.6 }, // C5
        { note: 587.33, duration: 0.4 }, // D5
        { note: 523.25, duration: 0.8 }, // C5
      ];
      
      let now = ctx.currentTime;
      notes.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.note, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + n.duration);
        now += n.duration;
      });
    } catch (e) {
      console.log('Web Audio Synth fallback active');
    }
  }

  let globalAudio = document.getElementById('bg-music');
  if (!globalAudio) {
    globalAudio = new Audio('assets/audio/indonesia-raya.mp3');
    globalAudio.loop = true;
  }

  function startMusic() {
    if (!globalAudio) {
      globalAudio = new Audio('assets/audio/indonesia-raya.mp3');
      globalAudio.loop = true;
    }

    globalAudio.volume = 0.7;
    
    try {
      const playPromise = globalAudio.play();

      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('Indonesia Raya playing successfully!');
          isPlaying = true;
          updateAudioButtonState();
        }).catch(error => {
          console.warn('HTML5 Audio play prevented, trying dynamic Audio instance:', error);
          const fallbackAudio = new Audio('assets/audio/indonesia-raya.mp3');
          fallbackAudio.loop = true;
          fallbackAudio.volume = 0.7;
          fallbackAudio.play().then(() => {
            globalAudio = fallbackAudio;
            isPlaying = true;
            updateAudioButtonState();
          }).catch(err2 => {
            console.warn('Fallback Audio failed, playing synth anthem:', err2);
            playSynthAnthem();
            isPlaying = true;
            updateAudioButtonState();
          });
        });
      } else {
        isPlaying = true;
        updateAudioButtonState();
      }
    } catch (e) {
      console.warn('Audio exception, using synth:', e);
      playSynthAnthem();
      isPlaying = true;
      updateAudioButtonState();
    }
  }

  function toggleMusic() {
    if (isPlaying) {
      if (globalAudio) globalAudio.pause();
      if (audioContext) audioContext.suspend();
      isPlaying = false;
    } else {
      startMusic();
    }
    updateAudioButtonState();
  }

  function updateAudioButtonState() {
    if (!audioToggleBtn) return;
    if (isPlaying) {
      audioToggleBtn.classList.add('playing');
      audioToggleBtn.setAttribute('title', 'Hentikan Musik');
    } else {
      audioToggleBtn.classList.remove('playing');
      audioToggleBtn.setAttribute('title', 'Putar Musik');
    }
  }

  // Open Invitation Event (Instant Audio Unlock on User Click / Touch)
  let isInvitationOpened = false;

  function handleOpenInvitation(e) {
    if (isInvitationOpened) return;
    isInvitationOpened = true;

    startMusic();

    if (coverModal) {
      coverModal.classList.add('fade-out');
      coverModal.style.pointerEvents = 'none';
      setTimeout(() => {
        coverModal.style.display = 'none';
        if (mainContent) {
          mainContent.classList.remove('hidden-content');
          mainContent.style.display = 'block';
        }
        document.body.style.overflow = 'auto';
      }, 600);
    }

    triggerConfetti();
    startFireworksCanvas();
  }

  if (btnOpenInvitation) {
    btnOpenInvitation.addEventListener('click', handleOpenInvitation);
    btnOpenInvitation.addEventListener('touchend', handleOpenInvitation);
  }

  // Audio Toggle Button Click
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleMusic);
    audioToggleBtn.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  // Mobile Menu Toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks) navLinks.classList.remove('active');
    });
  });

  // ==========================================================================
  // 2. COUNTDOWN TIMER (17 AGUSTUS 2026 10:00:00 WIB)
  // ==========================================================================
  const targetDate = new Date('August 17, 2026 10:00:00 GMT+0700').getTime();

  function updateCountdown() {
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.innerText = '00';
      hoursEl.innerText = '00';
      minutesEl.innerText = '00';
      secondsEl.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minutesEl.innerText = String(minutes).padStart(2, '0');
    secondsEl.innerText = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // ==========================================================================
  // 3. GUESTBOOK (GLOBAL GOOGLE SHEETS + LOCAL STORAGE FALLBACK)
  // ==========================================================================
  const guestbookForm = document.getElementById('guestbook-form');

  const defaultMessages = [
    {
      name: 'Budi Rahardjo',
      city: 'Jakarta Pusat',
      message: 'Selamat HUT RI ke-81! Semoga Indonesia semakin maju, sejahtera, dan bersatu dalam keberagaman! Merdeka! 🇮🇩',
      time: 'Baru saja'
    },
    {
      name: 'Ratna Sari',
      city: 'Bandung, Jawa Barat',
      message: 'Tantangan memang tidak mudah, tapi dengan gotong royong dan tekad baja, kita yakin Indonesia akan tumbuh lebih solid dan makmur!',
      time: '12 menit yang lalu'
    },
    {
      name: 'Andi Pratama',
      city: 'Makassar, Sulsel',
      message: 'Kemerdekaan bukan hanya warisan, tapi amanah untuk kita perjuangkan bersama demi keadilan seluruh rakyat Indonesia!',
      time: '45 menit yang lalu'
    },
    {
      name: 'Siti Aminah',
      city: 'Surabaya, Jawa Timur',
      message: 'Dirgahayu Republik Indonesia ke-81! Nusantara Baru, Indonesia Maju! Salam Kemerdekaan dari Jatim.',
      time: '1 jam yang lalu'
    },
    {
      name: 'Maria Latuconsina',
      city: 'Ambon, Maluku',
      message: 'Persatuan adalah kekuatan terbesar kita. Mari kita teruskan semangat Kemerdekaan 1945 untuk masa depan bangsa yang gemilang!',
      time: '2 jam yang lalu'
    },
    {
      name: 'Made Astawa',
      city: 'Denpasar, Bali',
      message: 'Semoga semangat para pahlawan selalu menjiwai generasi muda Indonesia untuk terus berkarya bagi ibu pertiwi!',
      time: '3 jam yang lalu'
    }
  ];

  async function loadMessages() {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;

    if (GOOGLE_SHEET_SCRIPT_URL) {
      try {
        const response = await fetch(GOOGLE_SHEET_SCRIPT_URL);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            renderMessages(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Gagal memuat pesan dari Google Sheets, menggunakan fallback:', err);
      }
    }

    // Local Storage Fallback
    try {
      const saved = localStorage.getItem('hut_ri_messages');
      let messages = saved ? JSON.parse(saved) : defaultMessages;
      renderMessages(messages);
    } catch (err) {
      renderMessages(defaultMessages);
    }
  }

  function renderMessages(messages) {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;

    messagesList.innerHTML = '';
    messages.forEach(msg => {
      const card = document.createElement('div');
      card.className = 'message-card';
      card.innerHTML = `
        <div class="message-header">
          <span class="message-author"><i class="fa-solid fa-user-check"></i> ${escapeHTML(msg.name)}</span>
          <span class="message-city">${escapeHTML(msg.city)} • ${msg.time}</span>
        </div>
        <p class="message-body">${escapeHTML(msg.message)}</p>
      `;
      messagesList.appendChild(card);
    });
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  if (guestbookForm) {
    guestbookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = guestbookForm.querySelector('button[type="submit"]');
      const nameInput = document.getElementById('user-name');
      const cityInput = document.getElementById('user-city');
      const messageInput = document.getElementById('user-message');

      if (!nameInput || !cityInput || !messageInput) return;

      const newMessage = {
        name: nameInput.value.trim(),
        city: cityInput.value.trim(),
        message: messageInput.value.trim(),
        time: 'Baru saja'
      };

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
      }

      // Tampilkan ucapan langsung di layar secara lokal
      try {
        const saved = localStorage.getItem('hut_ri_messages');
        let messages = saved ? JSON.parse(saved) : [...defaultMessages];
        messages.unshift(newMessage);
        localStorage.setItem('hut_ri_messages', JSON.stringify(messages));
        renderMessages(messages);
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }

      // Kirim ke Google Sheets dengan mode no-cors jika URL diisi
      if (GOOGLE_SHEET_SCRIPT_URL) {
        try {
          await fetch(GOOGLE_SHEET_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(newMessage)
          });
          console.log('Kirim ke Google Sheets berhasil dikirim');
        } catch (err) {
          console.warn('Gagal mengirim ke Google Sheets:', err);
        }
      }

      guestbookForm.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Kirim Doa & Ucapan';
      }

      triggerConfetti();
      alert('Terima kasih! Doa & ucapan Kemerdekaan Anda telah berhasil dikirim! 🇮🇩');

      // Reload dari server jika ada Google Sheets
      if (GOOGLE_SHEET_SCRIPT_URL) {
        setTimeout(loadMessages, 2000);
      }
    });
  }

  loadMessages();

  // ==========================================================================
  // 4. TRIVIA QUIZ KEMERDEKAAN
  // ==========================================================================
  const quizData = [
    {
      question: "Siapakah yang membacakan Teks Proklamasi Kemerdekaan Indonesia pada 17 Agustus 1945?",
      options: ["Ir. Soekarno", "Drs. Mohammad Hatta", "Sutan Sjahrir", "Ki Hajar Dewantara"],
      answer: 0
    },
    {
      question: "Di kota manakah Teks Proklamasi Kemerdekaan Indonesia dibacakan?",
      options: ["Bandung", "Yogyakarta", "Jakarta", "Surabaya"],
      answer: 2
    },
    {
      question: "Siapakah tokoh wanita yang menjahit Bendera Pusaka Sang Saka Merah Putih?",
      options: ["R.A. Kartini", "Ibu Fatmawati", "Cut Nyak Dien", "Dewi Sartika"],
      answer: 1
    },
    {
      question: "Apa makna utama warna Merah pada Bendera Negara Indonesia?",
      options: ["Kemakmuran", "Kesucian", "Keberanian", "Perdamaian"],
      answer: 2
    },
    {
      question: "Tahun berapakah Indonesia memproklamasikan Kemerdekaannya?",
      options: ["1928", "1945", "1950", "1998"],
      answer: 1
    }
  ];

  let currentQuestionIndex = 0;
  let score = 0;

  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const btnRestartQuiz = document.getElementById('btn-restart-quiz');
  const quizIntro = document.getElementById('quiz-intro');
  const quizBody = document.getElementById('quiz-body');
  const quizResult = document.getElementById('quiz-result');
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptions = document.getElementById('quiz-options');
  const quizProgress = document.getElementById('quiz-progress');
  const quizScore = document.getElementById('quiz-score');
  const resultText = document.getElementById('result-text');

  if (btnStartQuiz) btnStartQuiz.addEventListener('click', startQuiz);
  if (btnRestartQuiz) btnRestartQuiz.addEventListener('click', startQuiz);

  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    if (quizIntro) quizIntro.classList.add('hidden-element');
    if (quizResult) quizResult.classList.add('hidden-element');
    if (quizBody) quizBody.classList.remove('hidden-element');
    showQuestion();
  }

  function showQuestion() {
    if (!quizQuestion || !quizOptions) return;
    const q = quizData[currentQuestionIndex];
    quizQuestion.innerText = q.question;
    if (quizProgress) quizProgress.innerText = `Pertanyaan ${currentQuestionIndex + 1} dari ${quizData.length}`;
    if (quizScore) quizScore.innerText = `Skor: ${score}`;

    quizOptions.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('type', 'button');
      btn.innerText = `${String.fromCharCode(65 + idx)}. ${opt}`;
      btn.addEventListener('click', () => selectAnswer(idx));
      quizOptions.appendChild(btn);
    });
  }

  function selectAnswer(selectedIndex) {
    const q = quizData[currentQuestionIndex];
    const buttons = quizOptions ? quizOptions.querySelectorAll('.option-btn') : [];

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answer) {
        btn.classList.add('correct');
      } else if (idx === selectedIndex) {
        btn.classList.add('wrong');
      }
    });

    if (selectedIndex === q.answer) {
      score += 20;
      if (quizScore) quizScore.innerText = `Skor: ${score}`;
    }

    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < quizData.length) {
        showQuestion();
      } else {
        finishQuiz();
      }
    }, 1200);
  }

  function finishQuiz() {
    if (quizBody) quizBody.classList.add('hidden-element');
    if (quizResult) quizResult.classList.remove('hidden-element');
    if (resultText) resultText.innerText = `Skor Akhir Anda: ${score} dari 100!`;
    triggerConfetti();
  }

  // ==========================================================================
  // 5. SHARE UTILITIES
  // ==========================================================================
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnShareWA = document.getElementById('btn-share-wa');

  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      alert('Link undangan berhasil disalin ke clipboard! 🇮🇩');
    });
  }

  if (btnShareWA) {
    const waText = encodeURIComponent(
      '🇮🇩 Undangan Resmi Perayaan HUT RI ke-81 (17 Agustus 2026)!\nMari merayakan Hari Kemerdekaan Indonesia bersama. Buka undangan di sini:\n' + window.location.href
    );
    btnShareWA.setAttribute('href', `https://api.whatsapp.com/send?text=${waText}`);
  }

  // ==========================================================================
  // 6. CONFETTI & FIREWORKS ANIMATION
  // ==========================================================================
  function triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#FFFFFF', '#F59E0B']
      });
    }
  }

  function startFireworksCanvas() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let particles = [];
    const colors = ['#E11D48', '#FFFFFF', '#F59E0B', '#FBBF24', '#F43F5E'];

    function createExplosion(x, y) {
      const particleCount = 40;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 / particleCount) * i;
        const speed = Math.random() * 5 + 2;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.color || Math.random() * colors.length],
          alpha: 1,
          size: Math.random() * 3 + 2
        });
      }
    }

    createExplosion(canvas.width * 0.3, canvas.height * 0.3);
    createExplosion(canvas.width * 0.7, canvas.height * 0.3);

    let animId;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.alpha -= 0.015;

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
        }
      });

      if (particles.length > 0) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }

  console.log('App initialization completed successfully.');
});
