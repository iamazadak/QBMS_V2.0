
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PaperTemplate } from '@/entities/all';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const paperTemplateEntity = new PaperTemplate();

const PaperPreviewPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef();

  const loadTemplate = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await paperTemplateEntity.get(id);
      setTemplate(data);
    } catch (error) {
      toast({ variant: "destructive", description: "Failed to load template." });
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${template.title}.pdf`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleDownloadPdf}>Download PDF</Button>
      </div>
      <div ref={printRef} className="p-8 bg-white">
        <header className="text-center mb-8">
          <h1 className="text-2xl font-bold">{template.title}</h1>
          <h2 className="text-xl">{template.institution_name}</h2>
          <h3 className="text-lg">{template.program_name}</h3>
          <div className="flex justify-between mt-4">
            <span>{template.subject_name} [{template.subject_code}]</span>
            <span>Year: {template.year}</span>
          </div>
          <div className="flex justify-between">
            <span>Full Marks: {template.full_marks}</span>
            <span>Time: {template.time_duration}</span>
          </div>
        </header>

        <div className="mb-8">
          <h4 className="font-bold">General Instructions:</h4>
          <p>{template.general_instructions}</p>
        </div>

        {template.sections?.map((section, index) => (
          <section key={index} className="mb-8">
            <h4 className="text-lg font-bold mb-4">{section.name}</h4>
            {section.choice_enabled && (
              <p className="mb-4">(Answer any {section.choice_x} out of {section.choice_y} questions)</p>
            )}
            {section.questions?.map((q, i) => (
              <div key={q.id} className="mb-4">
                <p className="font-semibold">{i + 1}. {q.question.question_text}</p>
                {/* TODO: Render options for MCQ */}
              </div>
            ))}
          </section>
        ))}

        <footer className="text-center mt-8">
          <p>{template.footer_text}</p>
        </footer>
      </div>
    </div>
  );
};

export default PaperPreviewPage;
