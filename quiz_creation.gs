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

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Generic Assessment Creator GAS is running. Use POST to create assessments."
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  console.log("doPost triggered");
  try {
    let rawInput = "";
    
    // 1. Check for standard form parameter
    if (e.parameter && e.parameter.payload) {
      console.log("Found payload in parameter");
      rawInput = e.parameter.payload;
    } 
    // 2. Check for raw POST contents
    else if (e.postData && e.postData.contents) {
      console.log("Found payload in postData.contents (Length: " + e.postData.contents.length + ")");
      const contents = e.postData.contents;
      // If it's a form-encoded string like "payload=...", extract it
      if (contents.indexOf('payload=') === 0) {
        rawInput = decodeURIComponent(contents.substring(8).replace(/\+/g, ' '));
      } else {
        rawInput = contents;
      }
    }
    
    console.log("Raw Input Extracted. First 100 chars: " + (rawInput ? rawInput.substring(0, 100) : "null"));

    if (!rawInput) throw new Error("No data received in request contents.");

    // Clean any remaining encoding or wrapping (First Principles)
    let jsonString = rawInput;
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    const data = JSON.parse(jsonString);
    const meta = data.assessment_meta || {};
    const studentFields = data.student_fields || {};
    const questions = data.questions || [];

    console.log("Parsing complete. Questions count: " + questions.length);

    // 1. Create the Form
    console.log("Creating form with title: " + (meta.title || 'New Assessment'));
    const form = FormApp.create(meta.title || 'New Assessment');
    form.setIsQuiz(true);
    form.setAllowResponseEdits(false);
    form.setLimitOneResponsePerUser(true);
    
    // Set Description (Instructions)
    let description = meta.description || "";
    if (meta.program_name) description += "\n\nProgram: " + meta.program_name;
    if (meta.course_name) description += "\nCourse: " + meta.course_name;
    form.setDescription(description);

    console.log("Form created (ID: " + form.getId() + ")");

    // Advanced Form Settings
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
       console.log("Attempting to link to spreadsheet...");
       try {
         const ss = SpreadsheetApp.create(meta.title + " (Responses)");
         form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
         sheetUrl = ss.getUrl();
         console.log("Spreadsheet linked: " + sheetUrl);
       } catch (err) {
         console.warn("Failed to create spreadsheet", err);
       }
    }

    // ---------------------------------------------------------
    // SECTION 1: CANDIDATE INFORMATION
    // ---------------------------------------------------------
    
    // Add Multimedia (Intro Video/Image) at the top of Section 1 if present
    if (meta.video_url) {
      console.log("Adding video: " + meta.video_url);
      try {
        form.addVideoItem().setVideoUrl(meta.video_url).setTitle("Introductory Video");
      } catch (err) {
        console.warn("Invalid video URL provided", err);
      }
    }
    if (meta.image_url) {
       console.log("Adding banner image: " + meta.image_url);
       try {
        form.addImageItem().setImage(UrlFetchApp.fetch(meta.image_url)).setTitle("Assessment Banner");
      } catch (err) {
        console.warn("Invalid image URL provided", err);
      }
    }

    // Add Student Fields
    if (studentFields.full_name) {
      console.log("Adding Full Name field");
      form.addTextItem().setTitle("Full Name").setRequired(true);
    }
    
    if (studentFields.mobile) {
      console.log("Adding Mobile Number field");
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
      console.log("Adding Industry field");
      form.addTextItem().setTitle("Industry/Company Name").setRequired(true);
    }

    // ---------------------------------------------------------
    // PAGE BREAK -> SECTION 2: ASSESSMENT
    // ---------------------------------------------------------
    
    form.addPageBreakItem().setTitle('Assessment Questions').setGoToPage(FormApp.PageNavigationType.CONTINUE);

    // ---------------------------------------------------------
    // SECTION 2: QUESTIONS
    // ---------------------------------------------------------

    console.log("Processing " + questions.length + " questions...");
    questions.forEach((q, index) => {
      console.log("Adding question " + (index+1) + ": " + q.question_text.substring(0, 30) + "...");
      const item = form.addMultipleChoiceItem();
      item.setTitle(q.question_text)
          .setPoints(q.marks || 1)
          .setRequired(true);

      const choices = [];
      const options = q.options || {};
      
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

    console.log("All questions added. Compiling response...");

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
