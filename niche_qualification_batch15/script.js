
let currentExamId = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeForAttr(text) {
  return String(text).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

function renderHome() {
  const app = document.getElementById("app");
  document.getElementById("homeBtn").style.display = "none";
  app.innerHTML = `
    <section class="hero">
      <p class="badge">第15弾</p>
      <h2>超ニッチ資格クイズ集</h2>
      <p>20資格 × 各200問。毎回ランダムで50問出題します。回答後は自動で次の問題へ進みます。</p>
    </section>
    <section class="grid">
      ${window.exams.map(exam => `
        <a class="card" href="?exam=${exam.id}">
          <h3>${exam.name}</h3>
          <p>${exam.desc}</p>
          <span>開始する →</span>
        </a>
      `).join("")}
    </section>
  `;
}

function startExam(examId) {
  currentExamId = examId;
  const exam = window.exams.find(e => e.id === examId);
  const pool = window.quizData[examId] || [];
  document.getElementById("homeBtn").style.display = "inline-flex";

  if (!exam || pool.length === 0) {
    document.getElementById("app").innerHTML = `
      <div class="panel">
        <h2>問題データが見つかりません</h2>
        <p>トップへ戻って別の資格を選んでください。</p>
      </div>`;
    return;
  }

  currentQuestions = shuffleArray(pool).slice(0, 50);
  currentIndex = 0;
  score = 0;
  answered = false;
  renderQuestion();
}

function renderQuestion() {
  answered = false;
  const q = currentQuestions[currentIndex];
  const exam = window.exams.find(e => e.id === currentExamId);

  document.getElementById("app").innerHTML = `
    <section class="quiz">
      <div class="quizTop">
        <div>
          <p class="badge">${exam.name}</p>
          <h2>問題 ${currentIndex + 1} / ${currentQuestions.length}</h2>
        </div>
        <div class="score">正解 ${score}</div>
      </div>
      <div class="progress"><div style="width:${((currentIndex) / currentQuestions.length) * 100}%"></div></div>
      <p class="question">${q.question}</p>
      <div class="choices">
        ${q.choices.map(choice => `
          <button class="choiceBtn" onclick="selectAnswer(this, '${escapeForAttr(choice)}')">${choice}</button>
        `).join("")}
      </div>
      <div id="result"></div>
    </section>`;
}

function selectAnswer(button, choice) {
  if (answered) return;
  answered = true;
  const q = currentQuestions[currentIndex];
  const buttons = document.querySelectorAll(".choiceBtn");

  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) btn.classList.add("correct");
  });

  if (choice === q.answer) {
    score++;
    button.classList.add("correct");
    document.getElementById("result").innerHTML = `<div class="result ok">正解！<br>${q.explanation}</div>`;
  } else {
    button.classList.add("wrong");
    document.getElementById("result").innerHTML = `<div class="result ng">不正解。正解は「${q.answer}」です。<br>${q.explanation}</div>`;
  }

  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= currentQuestions.length) {
      renderFinish();
    } else {
      renderQuestion();
    }
  }, 1200);
}

function renderFinish() {
  const exam = window.exams.find(e => e.id === currentExamId);
  const percent = Math.round((score / currentQuestions.length) * 100);
  document.getElementById("app").innerHTML = `
    <section class="panel center">
      <p class="badge">${exam.name}</p>
      <h2>結果</h2>
      <p class="bigScore">${score} / ${currentQuestions.length}</p>
      <p>正答率：${percent}%</p>
      <div class="actions">
        <button onclick="startExam('${currentExamId}')">もう一度挑戦</button>
        <button onclick="location.href='index.html'">ホームへ戻る</button>
      </div>
    </section>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const examId = getQueryParam("exam");
  if (examId) startExam(examId);
  else renderHome();
});
