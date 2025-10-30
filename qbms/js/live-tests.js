import { supabase } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  loadQuizzes();
});

async function loadQuizzes() {
  const quizGrid = document.getElementById('quiz-grid');
  quizGrid.innerHTML = ''; // Clear existing content

  try {
    const { data: quizzes, error } = await supabase
      .from('exams')
      .select('*');

    if (error) {
      throw error;
    }

    if (quizzes.length === 0) {
      quizGrid.innerHTML = '<p>No quizzes found.</p>';
      return;
    }

    quizzes.forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'quiz-card';

      card.innerHTML = `
        <h3>${quiz.title}</h3>
        <div class="details">
          <p><strong>Total Questions:</strong> ${quiz.total_questions}</p>
          <p><strong>Total Marks:</strong> ${quiz.total_marks}</p>
          <p><strong>Duration:</strong> ${quiz.duration} minutes</p>
        </div>
        <div class="links">
          <a href="${quiz.editor_link}" target="_blank">Editor Link</a>
          <a href="${quiz.respondent_link}" target="_blank">Respondent Link</a>
        </div>
      `;

      quizGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Error loading quizzes:', error);
    quizGrid.innerHTML = '<p>Error loading quizzes. Please try again later.</p>';
  }
}
