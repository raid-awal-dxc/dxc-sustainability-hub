// Friendlier quiz renderer with cards, sticky submit bar, progress, and RETRY
async function renderQuiz(moduleId) {
  const user = await requireAuth();
  const questions = await getQuizQuestions(moduleId);
  const root = document.getElementById('quiz-container');

  if (!questions.length) {
    root.innerHTML = '<p class="card">No quiz available for this module yet.</p>';
    return;
  }

  // OPTIONAL: shuffle options for each question
  questions.forEach(q => {
    if (q.quiz_options?.length) {
      q.quiz_options = [...q.quiz_options].sort(() => Math.random() - 0.5);
    }
  });

  // Build container
  const wrap = document.createElement('div');
  wrap.className = 'quiz-wrap card';

  // Header
  const head = document.createElement('div');
  head.className = 'quiz-head';
  head.innerHTML = `
    <h2>Module Quiz</h2>
    <div class="quiz-meta">
      Passing threshold: <strong>${window.ENV.PASS_THRESHOLD}%</strong>
    </div>
  `;
  wrap.appendChild(head);

  // Form
  const form = document.createElement('form');
  form.id = 'quiz-form';
  wrap.appendChild(form);

  // Render questions
  questions.forEach((q, idx) => {
    const qCard = document.createElement('section');
    qCard.className = 'q-card';
    qCard.setAttribute('aria-labelledby', `q-title-${q.id}`);

    const title = document.createElement('div');
    title.className = 'q-title';
    title.innerHTML = `
      <div class="q-num">${idx + 1}</div>
      <div id="q-title-${q.id}" class="q-text">${q.question_text}</div>
    `;
    qCard.appendChild(title);

    const opts = document.createElement('div');
    opts.className = 'options';

    q.quiz_options.forEach(opt => {
      const row = document.createElement('label');
      row.className = 'option-row';
      row.setAttribute('for', `q_${q.id}_${opt.id}`);
      row.innerHTML = `
        <input type="radio" id="q_${q.id}_${opt.id}" name="q_${q.id}" value="${opt.id}" />
        <div class="option-label">${opt.option_text}</div>
      `;
      opts.appendChild(row);
    });

    qCard.appendChild(opts);

    // Area for per-question feedback (filled after submission)
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.style.display = 'none';
    qCard.appendChild(feedback);

    form.appendChild(qCard);
  });

  root.innerHTML = '';
  root.appendChild(wrap);

  // Sticky submit bar elements
  const submitBar = document.getElementById('quiz-submit-bar');
  const progressEl = document.getElementById('quiz-progress');
  const submitBtn = document.getElementById('quiz-submit');
  const retryBtn  = document.getElementById('quiz-retry'); // NEW

  // Track state so retry can reset cleanly
  let lastSubmitted = false; // NEW

  // Initialize progress
  const updateProgress = () => {
    const answered = questions.reduce((acc, q) => {
      const chosen = form.querySelector(`input[name="q_${q.id}"]:checked`);
      return acc + (chosen ? 1 : 0);
    }, 0);
    progressEl.textContent = `Answered ${answered} of ${questions.length}`;
    // Disable submit until all questions answered (change to false to allow partial)
    submitBtn.disabled = answered < questions.length;
    submitBtn.title = answered < questions.length
      ? 'Answer all questions to submit'
      : 'Submit your quiz';
  };
  updateProgress();

  // Watch input changes to update progress
  form.addEventListener('change', updateProgress);

  // ----- RETRY LOGIC (soft reset) ----- // NEW
  function softResetQuiz() {
    // Clear selected answers
    form.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = false; });

    // Hide feedback blocks and reset styles
    form.querySelectorAll('.feedback').forEach(fb => {
      fb.style.display = 'none';
      fb.classList.remove('bad');
      fb.textContent = '';
    });

    // Re-enable submit, reset text
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submit Quiz';
    submitBtn.classList.remove('ghost');
    retryBtn.style.display = 'none';

    // Reset state
    lastSubmitted = false;
    updateProgress();
    // Optional: Scroll to top of the quiz
    wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Click: Retry
  retryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    softResetQuiz();
  });

  // Handle submission
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // Prevent accidental double-submit
    if (submitBtn.disabled) return;

    // Score
    let correct = 0;
    questions.forEach(q => {
      const chosen = form.querySelector(`input[name="q_${q.id}"]:checked`);
      const chosenId = chosen ? chosen.value : null;
      const isRight = q.quiz_options.find(o => String(o.id) === String(chosenId))?.is_correct;

      // Show per-question feedback
      const card = chosen?.closest('.q-card') || form.querySelector(`#q-title-${q.id}`)?.closest('.q-card');
      const fb = card?.querySelector('.feedback');
      if (fb) {
        fb.style.display = 'block';
        if (isRight) {
          fb.classList.remove('bad');
          fb.innerHTML = `✅ Correct`;
        } else {
          fb.classList.add('bad');
          const correctText = q.quiz_options.find(o => o.is_correct)?.option_text || 'Correct answer available';
          fb.innerHTML = `❌ Incorrect &nbsp; • &nbsp; <em>Correct:</em> ${correctText}`;
        }
      }

      if (isRight) correct++;
    });

    const scorePct = Math.round((correct / questions.length) * 100);
    const passed = scorePct >= window.ENV.PASS_THRESHOLD;

    // Record attempt (always)
    await recordQuizAttempt(user.id, moduleId, scorePct, passed);

    // Update state
    lastSubmitted = true;
    retryBtn.style.display = 'inline-block'; // show retry after any submission
    retryBtn.textContent = passed ? 'Retake Quiz' : 'Retry Quiz';

    if (passed) {
      // Complete module + issue certificate
      await updateProgress(user.id, moduleId, 100, 'completed');
      const cert = await issueCertificate(user.id, moduleId, scorePct);
      const params = new URLSearchParams({
        module_id: moduleId,
        code: cert.certificate_code,
        score: scorePct
      });
      // small delay so users can see feedback flash
      setTimeout(() => {
        window.location.href = `certificate.html?${params.toString()}`;
      }, 500);
    } else {
      // Partial progress for failed attempt
      await updateProgress(user.id, moduleId, Math.max(60));
      alert(`Your score: ${scorePct}%. Passing threshold is ${window.ENV.PASS_THRESHOLD}%. Review feedback and try again.`);
      // Disable submit to avoid double submissions until they change answers or retry
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitted';
      submitBtn.classList.add('btn', 'ghost');
    }
  });
}