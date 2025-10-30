import { supabase } from '../lib/supabase';

class SupabaseEntity {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async list(sortBy = 'id', ascending = true) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order(sortBy, { ascending });
    if (error) throw error;
    return data;
  }

  async filter(criteria, sortBy = 'id', ascending = true) {
    let query = supabase.from(this.tableName).select('*');
    for (const key in criteria) {
      if (criteria[key] !== null) {
        query = query.eq(key, criteria[key]);
      }
    }
    const { data, error } = await query.order(sortBy, { ascending });
    if (error) throw error;
    return data;
  }

  async get(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { data: newRecord, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select();
    if (error) throw error;
    return newRecord[0];
  }

  async update(id, data) {
    const { data: updatedRecord, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select();
    if (error) throw error;
    return updatedRecord[0];
  }

  async delete(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}

export class Question extends SupabaseEntity {
  constructor() { super('questions'); }
}
export class Option extends SupabaseEntity {
  constructor() { super('options'); }
}
export class Subject extends SupabaseEntity {
  constructor() { super('subjects'); }
}
export class Course extends SupabaseEntity {
  constructor() { super('courses'); }
}
export class Program extends SupabaseEntity {
  constructor() { super('programs'); }
}
export class Exam extends SupabaseEntity {
  constructor() { super('exams'); }
}
export class User extends SupabaseEntity {
  constructor() { super('users'); }
}
export class AttemptedTest extends SupabaseEntity {
  constructor() { super('attempted_tests'); }
}
export class SavedQuestion extends SupabaseEntity {
  constructor() { super('saved_questions'); }
}
export class ReportedQuestion extends SupabaseEntity {
  constructor() { super('reported_questions'); }
}
export class LiveSession extends SupabaseEntity {
  constructor() { super('live_sessions'); }
}
export class LiveSessionAttendee extends SupabaseEntity {
  constructor() { super('live_session_attendees'); }
}
export class Candidate extends SupabaseEntity {
  constructor() { super('candidates'); }
}
export class Classroom extends SupabaseEntity {
  constructor() { super('classrooms'); }
}
export class ClassroomCandidate extends SupabaseEntity {
  constructor() { super('classroom_candidates'); }
}
export class ClassroomTest extends SupabaseEntity {
  constructor() { super('classroom_tests'); }
}
export class ExamQuestion extends SupabaseEntity {
  constructor() { super('exam_questions'); }
}
export class OnlineSession extends SupabaseEntity {
  constructor() { super('online_sessions'); }
}
export class OnlineSessionAttendee extends SupabaseEntity {
  constructor() { super('online_session_attendees'); }
}

export class PaperTemplate extends SupabaseEntity {
  constructor() {
    super('paper_templates');
  }

  async list(sortBy = 'created_at', ascending = false) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, sections:template_sections(*), subject:subjects(*), course:courses(*), program:programs(*)')
      .order(sortBy, { ascending });
    if (error) throw error;
    return data;
  }

  async get(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, sections:template_sections(*), subject:subjects(*), course:courses(*), program:programs(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { sections, ...templateData } = data;
    const { data: newTemplate, error: templateError } = await supabase
      .from(this.tableName)
      .insert([{ ...templateData, subject_id: templateData.subject_id || null, course_id: templateData.course_id || null, program_id: templateData.program_id || null }])
      .select()
      .single();

    if (templateError) throw templateError;

    if (sections && sections.length > 0) {
      const sectionData = sections.map(section => ({ ...section, template_id: newTemplate.id }));
      const { error: sectionError } = await supabase.from('template_sections').insert(sectionData);
      if (sectionError) throw sectionError;
    }

    return this.get(newTemplate.id);
  }

  async update(id, data) {
    const { sections, ...templateData } = data;
    const { data: updatedTemplate, error: templateError } = await supabase
      .from(this.tableName)
      .update({ ...templateData, subject_id: templateData.subject_id || null, course_id: templateData.course_id || null, program_id: templateData.program_id || null })
      .eq('id', id)
      .select()
      .single();

    if (templateError) throw templateError;

    const { error: deleteError } = await supabase.from('template_sections').delete().eq('template_id', id);
    if (deleteError) throw deleteError;

    if (sections && sections.length > 0) {
      const sectionData = sections.map(section => ({ ...section, template_id: updatedTemplate.id }));
      const { error: sectionError } = await supabase.from('template_sections').insert(sectionData);
      if (sectionError) throw sectionError;
    }

    return this.get(updatedTemplate.id);
  }
}

export class TemplateSection extends SupabaseEntity {
  constructor() {
    super('template_sections');
  }
}

export class QuestionPaper extends SupabaseEntity {
  constructor() {
    super('question_papers');
  }

  async list(sortBy = 'created_at', ascending = false) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, paper_template:paper_templates(*, subject:subjects(*), course:courses(*), program:programs(*))')
      .order(sortBy, { ascending });
    if (error) throw error;
    return data;
  }

  async get(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, paper_template:paper_templates(*, subject:subjects(*), course:courses(*), program:programs(*)), sections:question_paper_sections(*, template_section:template_sections(*), questions:question_paper_questions(*, question:questions(*)))')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(data) {
    const { template, sections } = data;
    const { data: newQuestionPaper, error: qpError } = await supabase
      .from(this.tableName)
      .insert([{ template_id: template.id, title: template.title }])
      .select()
      .single();

    if (qpError) throw qpError;

    if (sections && sections.length > 0) {
      for (const section of sections) {
        const { data: newSection, error: sectionError } = await supabase
          .from('question_paper_sections')
          .insert([{ question_paper_id: newQuestionPaper.id, template_section_id: section.id }])
          .select()
          .single();
        if (sectionError) throw sectionError;

        if (section.questions && section.questions.length > 0) {
          const questionData = section.questions.map(questionId => ({ question_paper_section_id: newSection.id, question_id: questionId }));
          const { error: questionError } = await supabase.from('question_paper_questions').insert(questionData);
          if (questionError) throw questionError;
        }
      }
    }

    return this.get(newQuestionPaper.id);
  }
}

export class QuestionPaperSection extends SupabaseEntity {
  constructor() {
    super('question_paper_sections');
  }
}

export class QuestionPaperQuestion extends SupabaseEntity {
  constructor() {
    super('question_paper_questions');
  }
}

export class ExamSection extends SupabaseEntity {
  constructor() { super('exam_sections'); }
}
