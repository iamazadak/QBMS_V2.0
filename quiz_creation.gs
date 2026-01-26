/**
 * Google Apps Script - Generic Assessment Creator
 * Decoupled logic that creates a form based on a structured JSON payload.
 * 
 * Payload Structure:
 * {
 *   assessment_meta: { title, description, program_name, course_name, video_url, confirmation_message, shuffle_questions ... },
 *   student_fields: { full_name: bool, mobile: bool, industry: bool },
 *   questions: [ { question_text, options: {A: text, B: text}, correct_option: "A", marks: 1, explanation: "..." } ]
 * }
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const meta = data.assessment_meta || {};
    const studentFields = data.student_fields || {};
    const questions = data.questions || [];

    // 1. Create the Form
    const form = FormApp.create(meta.title || 'New Assessment');
    form.setIsQuiz(true);
    form.setAllowResponseEdits(false);
    form.setLimitOneResponsePerUser(true);
    
    // Set Description (Instructions)
    let description = meta.description || "";
    if (meta.program_name) description += "\n\nProgram: " + meta.program_name;
    if (meta.course_name) description += "\nCourse: " + meta.course_name;
    form.setDescription(description);

    // Advanced Form Settings
    // Apply defaults or values from meta
    if (meta.collect_emails !== undefined) form.setCollectEmail(meta.collect_emails);
    if (meta.limit_response !== undefined) form.setLimitOneResponsePerUser(meta.limit_response);
    if (meta.edit_after_submit !== undefined) form.setAllowResponseEdits(meta.edit_after_submit);
    if (meta.show_progress_bar !== undefined) form.setProgressBar(meta.show_progress_bar);
    
    if (meta.confirmation_message) form.setConfirmationMessage(meta.confirmation_message);
    if (meta.shuffle_questions !== undefined) form.setShuffleQuestions(meta.shuffle_questions);
    if (meta.collectResponses !== undefined) form.setAcceptingResponses(meta.collectResponses);

    // ---------------------------------------------------------
    // SPREADSHEET INTEGRATION
    // ---------------------------------------------------------
    let sheetUrl = "";
    if (meta.link_to_sheet) {
       try {
         const ss = SpreadsheetApp.create(meta.title + " (Responses)");
         form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
         sheetUrl = ss.getUrl();
       } catch (err) {
         console.warn("Failed to create spreadsheet", err);
       }
    }

    // ---------------------------------------------------------
    // SECTION 1: CANDIDATE INFORMATION
    // ---------------------------------------------------------
    
    // Add Multimedia (Intro Video/Image) at the top of Section 1 if present
    if (meta.video_url) {
      try {
        form.addVideoItem().setVideoUrl(meta.video_url).setTitle("Introductory Video");
      } catch (err) {
        console.warn("Invalid video URL provided", err);
      }
    }
    if (meta.image_url) {
       try {
        form.addImageItem().setImage(UrlFetchApp.fetch(meta.image_url)).setTitle("Assessment Banner");
      } catch (err) {
        console.warn("Invalid image URL provided", err);
      }
    }

    // Add Student Fields
    if (studentFields.full_name) {
      form.addTextItem().setTitle("Full Name").setRequired(true);
    }
    
    if (studentFields.mobile) {
      // Add validation for Mobile Number (Must be a number)
      const mobileValidation = FormApp.createTextValidation()
        .setHelpText('Please enter a valid mobile number.')
        .requireNumber()
        .build();
      
      form.addTextItem()
          .setTitle("Mobile Number")
          .setRequired(true)
          .setValidation(mobileValidation);
    }
    
    if (studentFields.industry) {
      form.addTextItem().setTitle("Industry/Company Name").setRequired(true);
    }

    // ---------------------------------------------------------
    // PAGE BREAK -> SECTION 2: ASSESSMENT
    // ---------------------------------------------------------
    
    form.addPageBreakItem().setTitle('Assessment Questions').setGoToPage(FormApp.PageNavigationType.CONTINUE);

    // ---------------------------------------------------------
    // SECTION 2: QUESTIONS
    // ---------------------------------------------------------

    questions.forEach((q) => {
      const item = form.addMultipleChoiceItem();
      item.setTitle(q.question_text)
          .setPoints(q.marks || 1)
          .setRequired(true);

      const choices = [];
      const options = q.options || {};
      
      // Shuffle options locally if needed, but FormApp.setShuffleQuestions handles question order.
      // Option order is typically fixed unless we code randomization here.
      // Keeping it simple: Render order as received.
      
      Object.keys(options).forEach(key => {
        const isCorrect = (key === q.correct_option);
        choices.push(item.createChoice(options[key], isCorrect));
      });

      item.setChoices(choices);
      
      if (q.explanation) {
        const feedback = FormApp.createFeedback().setText(q.explanation).build();
        item.setFeedbackForCorrect(feedback);
        item.setFeedbackForIncorrect(feedback);
      }
    });

    const response = {
      status: "success",
      formId: form.getId(),
      formUrl: form.getEditUrl(),
      publishedUrl: form.getPublishedUrl(),
      sheetUrl: sheetUrl
    };

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
