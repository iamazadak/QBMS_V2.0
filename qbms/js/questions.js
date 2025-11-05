import { supabase } from './config.js';
import { showNotification } from './notification.js';
import { showSuccessModal } from './success-modal.js';
import { setTotalItems } from './pagination.js';

document.getElementById('hamburger-icon').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('collapsed');
});

let editQuestionId = null; // null = add, number = edit
let selectedQuestionIds = []; // To store IDs of selected questions



console.log("Yes");

// ===== OPEN MODAL =====
function openModal() {
  console.log("Add Question Window Opened");
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  editQuestionId = null;
  document.getElementById('questionForm').reset();
}

function openBulkUploadModal() {
    document.getElementById("bulkUploadModal").style.display = "flex";
}

function closeBulkUploadModal() {
    document.getElementById("bulkUploadModal").style.display = "none";
}

document.getElementById('closeBulkUploadModal').addEventListener('click', closeBulkUploadModal);

// ===== LOAD QUESTIONS =====
export async function loadQuestions(page = 1, searchQuery = '', filters = []) {
  let query = supabase.from('questions').select(`
    id,
    question_text,
    level,
    subjects (
      name,
      year,
      courses (
        name,
        programs (
          name
        )
      )
    ),
    options (
      option_text,
      is_correct
    )
  `, { count: 'exact' });

  if (searchQuery) {
    query = query.ilike('question_text', `%${searchQuery}%`);
  }

  console.log('Applying filters:', filters);

  const difficultyFilters = filters.filter(f => f.type === 'difficulty');
  difficultyFilters.forEach(filter => {
    query = query.eq('level', filter.value);
  });

  const subjectRelatedFilters = filters.filter(f => f.type !== 'difficulty');
  if (subjectRelatedFilters.length > 0) {
    const subjectIdPromises = subjectRelatedFilters.map(async (filter) => {
      let subjectQuery = supabase.from('subjects').select('id');
      if (filter.type === 'year') {
        subjectQuery = subjectQuery.eq('year', filter.value);
      } else if (filter.type === 'subject') {
        subjectQuery = subjectQuery.eq('name', filter.value);
      } else if (filter.type === 'course') {
        const { data: courses, error } = await supabase.from('courses').select('id').eq('name', filter.value);
        if (error || !courses || courses.length === 0) {
          return [];
        }
        const courseIds = courses.map(c => c.id);
        subjectQuery = subjectQuery.in('course_id', courseIds);
      } else if (filter.type === 'program') {
        const { data: programs, error } = await supabase.from('programs').select('id').eq('name', filter.value);
        if (error || !programs || programs.length === 0) {
          return [];
        }
        const programIds = programs.map(p => p.id);
        const { data: courses, error: courseError } = await supabase.from('courses').select('id').in('program_id', programIds);
        if (courseError || !courses || courses.length === 0) {
          return [];
        }
        const courseIds = courses.map(c => c.id);
        subjectQuery = subjectQuery.in('course_id', courseIds);
      }
      const { data: subjects, error } = await subjectQuery;
      if (error) {
        return [];
      }
      return subjects.map(s => s.id);
    });

    const subjectIdArrays = await Promise.all(subjectIdPromises);
    if (subjectIdArrays.length > 0) {
      const intersectingSubjectIds = subjectIdArrays.reduce((a, b) => a.filter(c => b.includes(c)));
      if (intersectingSubjectIds.length > 0) {
        query = query.in('subject_id', intersectingSubjectIds);
      } else {
        // If there are subject filters but no intersecting subjects, then no questions will match.
        const tbody = document.getElementById('tbody');
        tbody.innerHTML = '';
        setTotalItems(0);
        return;
      }
    }
  }

  const { data: questions, error, count } = await query
    .order('id', { ascending: true })
    .range((page - 1) * 20, page * 20 - 1);

  if (error) {
    console.error(error);
    return showNotification(error.message, 'error');
  }

  const tbody = document.getElementById('tbody');
  tbody.innerHTML = '';

  questions.forEach(q => {
    const correctOption = q.options.find(o => o.is_correct);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" class="row-checkbox" data-id="${q.id}" /></td>
      <td>${q.question_text}</td>
      <td>${q.options[0]?.option_text || ''}</td>
      <td>${q.options[1]?.option_text || ''}</td>
      <td>${q.options[2]?.option_text || ''}</td>
      <td>${q.options[3]?.option_text || ''}</td>
      <td>${correctOption ? correctOption.option_text : ''}</td>
      <td>${q.subjects ? q.subjects.name : ''}</td>
      <td>${q.subjects && q.subjects.courses ? q.subjects.courses.name : ''}</td>
      <td>${q.subjects && q.subjects.courses && q.subjects.courses.programs ? q.subjects.courses.programs.name : ''}</td>
      <td>${q.level}</td>
      <td>${q.subjects ? q.subjects.year : ''}</td>
      <td class="relative-position">
        <div class="ellipsis-menu">⋮</div>
        <div class="row-menu hidden">
          <button onclick="editQuestion('${q.id}')">Edit</button>
          <button onclick="deleteQuestion('${q.id}')">Delete</button>
        </div>
      </td>
    `;
    const checkbox = row.querySelector('.row-checkbox');
    checkbox.checked = selectedQuestionIds.includes(q.id.toString());
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedQuestionIds.push(e.target.dataset.id);
      } else {
        selectedQuestionIds = selectedQuestionIds.filter(id => id !== e.target.dataset.id);
      }
      updateQuestionCount();
    });
    tbody.appendChild(row);
  });

  attachEllipsisEvents();
  if (count) {
    setTotalItems(count);
  }
}

// ===== HEADER ACTIONS =====


document.getElementById('selectAll').addEventListener('click', e => {
  const checkboxes = document.querySelectorAll('.row-checkbox');
  if (e.target.checked) {
    selectedQuestionIds = Array.from(checkboxes).map(cb => cb.dataset.id);
  } else {
    selectedQuestionIds = [];
  }
  checkboxes.forEach(checkbox => {
    checkbox.checked = e.target.checked;
  });
  updateQuestionCount();
});

document.getElementById('moreActionsBtn').addEventListener('click', e => {
  e.stopPropagation();
  document.getElementById('moreActionsDropdown').classList.toggle('show');
});

document.getElementById('addQuestionBtn').addEventListener('click', async e => {
  e.preventDefault();
  console.log("Add Question Clicked");
  openModal();
  document.getElementById('moreActionsDropdown').classList.remove('show'); // Hide dropdown after click
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportToCsv();
});

async function exportToCsv() {
  const { data: questions, error } = await supabase.from('questions').select(`
    question_text,
    level,
    subjects (name, year, courses (name, programs (name))),
    options (option_text, is_correct)
  `);

  if (error) {
    console.error(error);
    return showNotification('Error exporting questions', 'error');
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  const headers = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Answer', 'Subject', 'Course', 'Program', 'Difficulty', 'Year'];
  csvContent += headers.join(',') + '\r\n';

  questions.forEach(q => {
    const correctOption = q.options.find(o => o.is_correct);
    const row = [
      `"${q.question_text}"`,
      `"${q.options[0]?.option_text || ''}"`,
      `"${q.options[1]?.option_text || ''}"`,
      `"${q.options[2]?.option_text || ''}"`,
      `"${q.options[3]?.option_text || ''}"`,
      `"${correctOption ? correctOption.option_text : ''}"`,
      `"${q.subjects ? q.subjects.name : ''}"`,
      `"${q.subjects && q.subjects.courses ? q.subjects.courses.name : ''}"`,
      `"${q.subjects && q.subjects.courses && q.subjects.courses.programs ? q.subjects.courses.programs.name : ''}"`,
      `"${q.level}"`,
      `"${q.subjects ? q.subjects.year : ''}"`
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'questions.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById('deleteSelectedBtn').addEventListener('click', async () => {
  const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
  if (selectedCheckboxes.length === 0) {
    return showNotification('No questions selected', 'warning');
  }

  if (confirm(`Are you sure you want to delete ${selectedCheckboxes.length} questions?`)) {
    const idsToDelete = Array.from(selectedCheckboxes).map(cb => cb.getAttribute('data-id'));
    await deleteSelectedQuestions(idsToDelete);
  }
});

async function deleteSelectedQuestions(ids) {
  const { error } = await supabase.from('questions').delete().in('id', ids);
  if (error) {
    console.error(error);
    return showNotification('Error deleting questions', 'error');
  }
  showNotification('Questions deleted successfully', 'success');
  loadQuestions();
}

document.getElementById('bulkUploadBtn').addEventListener('click', async e => {
  e.preventDefault();
  console.log("Bulk Upload Clicked");
  openBulkUploadModal();
  document.getElementById('moreActionsDropdown').classList.remove('show'); // Hide dropdown after click
});

// Close the dropdown if the user clicks outside of it
window.addEventListener('click', function(event) {
  if (!event.target.matches('#moreActionsBtn')) {
    const dropdowns = document.getElementsByClassName('dropdown');
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show') && openDropdown.id === 'moreActionsDropdown') {
        openDropdown.classList.remove('show');
      }
    }
  }
});

document.getElementById('closeModal').addEventListener('click', closeModal);





// ===== ADD / EDIT QUESTION FORM SUBMISSION =====
document.getElementById('questionForm').addEventListener('submit', async e => {
  e.preventDefault();

  const question_text = document.getElementById('q_text').value;
  const options = [
    { label: 'A', text: document.getElementById('q_opt_a').value, is_correct: false },
    { label: 'B', text: document.getElementById('q_opt_b').value, is_correct: false },
    { label: 'C', text: document.getElementById('q_opt_c').value, is_correct: false },
    { label: 'D', text: document.getElementById('q_opt_d').value, is_correct: false },
  ];
  const answerLabel = document.getElementById('q_answer').value;
  const program_name = document.getElementById('q_program').value;
  const subject_name = document.getElementById('q_subject').value;
  const course_name = document.getElementById('q_course').value;
  const levelInput = document.getElementById('q_diff').value.toLowerCase(); // Get raw input and normalize
  const year = parseInt(document.getElementById('q_year').value);

  // Validate and normalize level
  const validLevels = ['easy', 'medium', 'hard'];
  const level = validLevels.includes(levelInput) ? levelInput : 'easy'; // Default to 'easy' if invalid

  // Set the correct answer
  const correctOption = options.find(o => o.label === answerLabel);
  if (correctOption) {
    correctOption.is_correct = true;
  }

  try {
    // Insert or get Program
    let { data: programs, error: programError } = await supabase
      .from('programs')
      .select('id')
      .eq('name', program_name);
    if (programError) throw programError;
    let program_id;
    if (programs?.length > 0) {
      program_id = programs[0].id;
    } else {
      const { data: newProgram, error: insertError } = await supabase
        .from('programs')
        .insert({ name: program_name })
        .select()
        .single();
      if (insertError) throw insertError;
      program_id = newProgram.id;
    }

    // Insert or get Course
    let { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('name', course_name);
    if (courseError) throw courseError;
    let course_id;
    if (courses?.length > 0) {
      course_id = courses[0].id;
      if (courses[0].program_id !== program_id) {
        const { error: updateError } = await supabase
          .from('courses')
          .update({ program_id })
          .eq('id', course_id);
        if (updateError) throw updateError;
      }
    } else {
      const { data: newCourse, error: insertError } = await supabase
        .from('courses')
        .insert({ name: course_name, program_id })
        .select()
        .single();
      if (insertError) throw insertError;
      course_id = newCourse.id;
    }

    // Insert or get Subject
    let { data: subjects, error: subjectError } = await supabase
      .from('subjects')
      .select('id')
      .eq('name', subject_name);
    if (subjectError) throw subjectError;
    let subject_id;
    if (subjects?.length > 0) {
      subject_id = subjects[0].id;
      if (subjects[0].course_id !== course_id || subjects[0].year !== year) {
        const { error: updateError } = await supabase
          .from('subjects')
          .update({ course_id, year })
          .eq('id', subject_id);
        if (updateError) throw updateError;
      }
    } else {
      const { data: newSubject, error: insertError } = await supabase
        .from('subjects')
        .insert({ name: subject_name, course_id, year })
        .select()
        .single();
      if (insertError) throw insertError;
      subject_id = newSubject.id;
    }

    let question_id;
    if (editQuestionId) {
      // UPDATE QUESTION
      const { data: qUpdated, error: updateError } = await supabase
        .from('questions')
        .update({ question_text, level, subject_id })
        .eq('id', editQuestionId)
        .select()
        .single();
      if (updateError) throw updateError;
      question_id = qUpdated.id;

      // DELETE EXISTING OPTIONS
      const { error: deleteError } = await supabase
        .from('options')
        .delete()
        .eq('question_id', question_id);
      if (deleteError) throw deleteError;
    } else {
      // INSERT NEW QUESTION
      const { data: qNew, error: insertError } = await supabase
        .from('questions')
        .insert({ question_text, level, subject_id })
        .select()
        .single();
      if (insertError) throw insertError;
      question_id = qNew.id;
    }

    // INSERT OPTIONS
    const optionInserts = options.map(o => ({
      question_id,
      option_text: o.text,
      is_correct: o.is_correct,
    }));
    const { error: optionError } = await supabase.from('options').insert(optionInserts);
    if (optionError) throw optionError;

    closeModal();
    loadQuestions();
    showSuccessModal(`Question ${editQuestionId ? 'updated' : 'added'} successfully!`);
  } catch (err) {
    showNotification(err.message, 'error');
  }
});

async function testSupabaseConnectionAndTables() {
  try {
    const { data, error } = await supabase.rpc('list_user_tables');

    if (error) {
      console.error('Failed to list tables:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Connection successful! Tables found:', data);
      const expectedTables = ['courses', 'subjects', 'questions', 'options', 'programs', 'exams', 'tags', 'profiles', 'question_tags', 'exam_sections', 'exam_questions', 'exam_attempts', 'student_answers', 'question_bookmarks', 'question_feedback', 'exam_analytics', 'question_analytics', 'user_performance_analytics'];
      const foundTables = data
        .filter(table => table.table_schema === 'public')
        .map(table => table.table_name);
      console.log('Tables in public schema:', foundTables);

      expectedTables.forEach(table => {
        if (foundTables.includes(table)) {
          console.log(`Table "${table}" exists.`);
        } else {
          console.warn(`Table "${table}" is missing.`);
        }
      });
    } else {
      console.log('Connection successful, but no user tables found.');
    }
  } catch (err) {
    console.error('Connection test failed with unexpected error:', err.message);
  }
}

// Run the test
testSupabaseConnectionAndTables();

// ===== EDIT QUESTION =====
window.editQuestion = async (id) => {
  try {
    editQuestionId = id;
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        level,
        subjects (
          name,
          year,
          courses (
            name,
            programs (
              name
            )
          )
        ),
        options (
          option_text,
          is_correct
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('No question found with ID:', id);
        showNotification('Question not found.', 'warning');
        closeModal();
        return;
      }
      throw error;
    }

    document.getElementById('q_text').value = question.question_text || '';
    
    // Populate options (assuming 4 options in order)
    const options = question.options || [];
    document.getElementById('q_opt_a').value = options[0]?.option_text || '';
    document.getElementById('q_opt_b').value = options[1]?.option_text || '';
    document.getElementById('q_opt_c').value = options[2]?.option_text || '';
    document.getElementById('q_opt_d').value = options[3]?.option_text || '';

    // Set the correct answer
    const correctOption = options.find(o => o.is_correct);
    if (correctOption) {
      document.getElementById('q_answer').value = options.indexOf(correctOption) === 0 ? 'A' :
        options.indexOf(correctOption) === 1 ? 'B' :
        options.indexOf(correctOption) === 2 ? 'C' : 'D';
    } else {
      document.getElementById('q_answer').value = '';
    }

    document.getElementById('q_program').value = question.subjects?.courses?.programs?.name || '';
    document.getElementById('q_subject').value = question.subjects?.name || '';
    document.getElementById('q_course').value = question.subjects?.courses?.name || '';
    document.getElementById('q_diff').value = question.level || 'easy'; // Default to 'easy' if undefined
    document.getElementById('q_year').value = question.subjects?.year || '';

    openModal();
  } catch (err) {
    showNotification(err.message, 'error');
  }
};

// ===== DELETE QUESTION =====
window.deleteQuestion = async (id) => {
  if (!confirm('Are you sure you want to delete this question?')) return;
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) {
    showNotification(error.message, 'error');
  } else {
    loadQuestions();
    showNotification('Question deleted successfully!', 'success');
  }
};

// ===== ROW MENU TOGGLE =====
function attachEllipsisEvents() {
  document.querySelectorAll('.ellipsis-menu').forEach(el => {
    el.onclick = e => {
      const dd = el.nextElementSibling;
      dd.classList.toggle('hidden');
      e.stopPropagation();
    };
  });
  document.addEventListener('click', e => {
    document.querySelectorAll('.row-menu').forEach(dd => {
      if (!e.target.closest('.ellipsis-menu')) dd.classList.add('hidden');
    });
  });
}

loadQuestions();

// ===== FILTERS =====
let currentFilterType = '';

async function populateFilterOptions() {
  const filterOptionsDropdown = document.getElementById('filterOptionsDropdown');
  filterOptionsDropdown.innerHTML = '';

  if (!currentFilterType) return;

  let data = [];
  let error;

  if (currentFilterType === 'difficulty') {
    // Difficulty levels are fixed, no need to query DB
    data = ['easy', 'medium', 'hard'];
  } else if (currentFilterType === 'year') {
    data = ['1', '2', '3'];
  } else if (currentFilterType === 'subject') {
    ({ data, error } = await supabase.from('subjects').select('name', { distinct: true }));
    data = data ? data.map(item => item.name) : [];
  } else if (currentFilterType === 'course') {
    ({ data, error } = await supabase.from('courses').select('name', { distinct: true }));
    data = data ? data.map(item => item.name) : [];
  } else if (currentFilterType === 'program') {
    ({ data, error } = await supabase.from('programs').select('name', { distinct: true }));
    data = data ? data.map(item => item.name) : [];
  }

  if (error) {
    console.error(error);
    return;
  }

  console.log('Populating filter options with:', data);
  data.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    filterOptionsDropdown.appendChild(option);
  });
}

export let activeFilters = [];

export function getActiveFilters() {
  return activeFilters;
}

function addFilter(type, value) {
  activeFilters.push({ type, value });
  renderFilterPills();
  loadQuestions(1, '', activeFilters);
}

function removeFilter(index) {
  activeFilters.splice(index, 1);
  renderFilterPills();
  loadQuestions(1, '', activeFilters);
}

function renderFilterPills() {
  const filterPillsContainer = document.getElementById('filter-pills-container');
  filterPillsContainer.innerHTML = '';
  activeFilters.forEach((filter, index) => {
    const pill = document.createElement('div');
    pill.className = 'filter-pill';
    pill.innerHTML = `
      <span>${filter.type}: ${filter.value}</span>
      <span class="cancel-icon" data-index="${index}">x</span>
    `;
    filterPillsContainer.appendChild(pill);

    pill.querySelector('.cancel-icon').addEventListener('click', e => {
      const indexToRemove = e.target.getAttribute('data-index');
      removeFilter(indexToRemove);
    });
  });
}

  const filterTypeDropdown = document.getElementById('filterTypeDropdown');
  const searchInput = document.getElementById('searchInput');
  const filterOptionsContainer = document.getElementById('filterOptionsContainer');
  const filterOptionsDropdown = document.getElementById('filterOptionsDropdown');

  const applyFiltersBtn = document.getElementById('apply-filters-btn');

  filterTypeDropdown.addEventListener('change', e => {
    currentFilterType = e.target.value;
    searchInput.placeholder = `Search by ${currentFilterType}...`;
    searchInput.value = '';
    if(currentFilterType === ''){
        searchInput.placeholder = '🔍 Search Question…';
    }
  });

  searchInput.addEventListener('focus', () => {
    if (currentFilterType) {
      populateFilterOptions();
      filterOptionsContainer.style.display = 'block';
    }
  });

  searchInput.addEventListener('input', e => {
    loadQuestions(1, e.target.value, activeFilters);
  });

  applyFiltersBtn.addEventListener('click', () => {
    const selectedOptions = Array.from(filterOptionsDropdown.selectedOptions);
    selectedOptions.forEach(option => {
      activeFilters.push({ type: currentFilterType, value: option.value });
    });
    renderFilterPills();
    loadQuestions(1, '', activeFilters);
    filterOptionsContainer.style.display = 'none';
  });

  document.addEventListener('click', e => {
    if (!filterOptionsContainer.contains(e.target) && e.target !== searchInput) {
      filterOptionsContainer.style.display = 'none';
    }
  });



// ===== INIT =====