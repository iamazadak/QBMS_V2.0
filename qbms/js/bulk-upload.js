import { supabase } from './config.js';
import { showNotification } from './notification.js';

document.getElementById('downloadTemplateBtn').addEventListener('click', () => {
  const csvContent = `question_text,option_a,option_b,option_c,option_d,answer,subject,course,difficulty_level,year,program\nExample question?,A,B,C,D,A,Math,BSc,1,2025,Science\n`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'question_template.csv';
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('uploadCsvBtn').addEventListener('click', async () => {
  const file = document.getElementById('csvFileInput').files[0];
  if (!file) return showNotification('Please select a CSV file', 'error');

  const text = await file.text();
  const rows = text.split('\n').slice(1); // Skip header
  const uploadStatus = document.getElementById('uploadStatus');
  uploadStatus.innerHTML = '';
  
  let successCount = 0;
  let failCount = 0;
  let formatFailCount = 0;

  for (let row of rows) {
    if (!row.trim()) continue;
    try {
      const [question_text, option_a, option_b, option_c, option_d, answer, subject_name, course_name, difficulty_level_num, year, program_name] = row.split(',').map(c => c.trim());

      let level;
      console.log(row,"row");
      console.log(difficulty_level_num,"difficulty_level_num");
      
      if (difficulty_level_num === '1') {
        level = 'easy';
      } else if (difficulty_level_num === '2') {
        level = 'medium';
      } else if (difficulty_level_num === '3') {
        level = 'hard';
      } else {
        console.log("Here 1");
        formatFailCount++;
        continue;
      }

      if (!question_text || !option_a || !option_b || !option_c || !option_d || !answer || !subject_name || !course_name || !year || !program_name) {
        console.log("Here 2");
        formatFailCount++;
        continue;
      }

      // ===== Insert or Get Program =====
      let { data: programData, error: programErr } = await supabase
        .from('programs')
        .select('id')
        .eq('name', program_name)
        .single();
      let program_id;
      if (!programData) {
        const { data: newProgram } = await supabase.from('programs').insert({ name: program_name }).select().single();
        program_id = newProgram.id;
      } else {
        program_id = programData.id;
      }

      // ===== Insert or Get Course =====
      let { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('id')
        .eq('name', course_name)
        .single();
      let course_id;
      if (!courseData) {
        const { data: newCourse } = await supabase.from('courses').insert({ name: course_name, program_id }).select().single();
        course_id = newCourse.id;
      } else {
        course_id = courseData.id;
      }

      // ===== Insert or Get Subject =====
      let { data: subjectData, error: subjectErr } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subject_name)
        .single();
      let subject_id;
      if (!subjectData) {
        const { data: newSubject } = await supabase.from('subjects').insert({ name: subject_name, course_id, year: parseInt(year) }).select().single();
        subject_id = newSubject.id;
      } else {
        subject_id = subjectData.id;
      }

      // ===== Insert Question =====
      const { data: questionData, error: questionErr } = await supabase
        .from('questions')
        .insert({
          question_text,
          subject_id,
          level
        })
        .select()
        .single();
      if (questionErr) throw questionErr;

      const question_id = questionData.id;

      // ===== Insert Options =====
      const options = [
        { option_text: option_a, is_correct: answer === 'A' },
        { option_text: option_b, is_correct: answer === 'B' },
        { option_text: option_c, is_correct: answer === 'C' },
        { option_text: option_d, is_correct: answer === 'D' }
      ];

      const { error: optionsErr } = await supabase
        .from('options')
        .insert(options.map(o => ({ ...o, question_id })));
      if (optionsErr) throw optionsErr;

      successCount++;
    } catch (err) {
      console.error('Error uploading row:', row, err.message);
      failCount++;
    }
  }

  uploadStatus.innerHTML = `<strong>Upload Complete:</strong> ${successCount} successful, ${failCount} failed., ${formatFailCount} failed.`;
  showNotification(`Upload finished: ${successCount} success, ${failCount} fail!., ${formatFailCount} failed.`, 'success');
});
