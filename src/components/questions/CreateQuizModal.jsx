import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    Clock,
    FileText,
    Info,
    Sparkles,
    Calendar as CalendarIcon,
    Share2,
    ExternalLink,
    Loader2,
    Video,
    Image as ImageIcon,
    GraduationCap,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    UserCheck,
    Smartphone,
    Building2,
    MessageSquare,
    Shuffle
} from "lucide-react";
import { Exam, ExamQuestion, Program, Course, Subject } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function CreateQuizModal({ isOpen, onClose, selectedQuestions, onQuizCreated }) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isPushingToGoogle, setIsPushingToGoogle] = useState(false);

    const [programs, setPrograms] = useState([]);
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [years, setYears] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration_minutes: 30,
        exam_type: "live_test",
        is_published: true,
        program_id: "",
        course_id: "",
        subject_id: "",
        year: String(new Date().getFullYear()),
        push_to_google: false,
        video_url: "",
        image_url: "",
        editor_link: "",
        respondent_link: "",
        require_full_name: true,
        require_mobile: true,
        require_industry: false,
        // Advanced Settings
        confirmation_message: "Thank you! Your responses have been recorded.",
        shuffle_questions: false,
        collect_emails: false,
        limit_response: false,
        edit_after_submit: false,
        show_progress_bar: false,
        link_to_sheet: false
    });

    const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.positive_marks || 0), 0);

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            setStep(1);
        }
    }, [isOpen]);

    const loadInitialData = async () => {
        if (selectedQuestions && selectedQuestions.length > 0) {
            // Extract unique entities from selected questions
            const uniquePrograms = Array.from(new Map(selectedQuestions.map(q => [q.program?.id, q.program]).filter(([id]) => id)).values());
            const uniqueCourses = Array.from(new Map(selectedQuestions.map(q => [q.course?.id, q.course]).filter(([id]) => id)).values());
            const uniqueSubjects = Array.from(new Map(selectedQuestions.map(q => [q.subject?.id, q.subject]).filter(([id]) => id)).values());
            const uniqueYears = [...new Set(selectedQuestions.map(q => q.subject?.year ? String(q.subject.year) : null).filter(Boolean))].sort((a, b) => b - a);

            setPrograms(uniquePrograms);
            setCourses(uniqueCourses);
            setSubjects(uniqueSubjects);
            setYears(uniqueYears.length > 0 ? uniqueYears : [String(new Date().getFullYear())]);

            // Auto-populate form with values from the first selected question
            const firstQ = selectedQuestions[0];
            setFormData(prev => ({
                ...prev,
                program_id: firstQ?.program?.id || "",
                course_id: firstQ?.course?.id || "",
                subject_id: firstQ?.subject?.id || "",
                year: firstQ?.subject?.year ? String(firstQ.subject.year) : String(new Date().getFullYear())
            }));
        } else {
            try {
                const [pData, cData, sData, yData] = await Promise.all([
                    new Program().list(),
                    new Course().list(),
                    new Subject().list(),
                    new Subject().getUniqueValues('year')
                ]);
                setPrograms(pData || []);
                setCourses(cData || []);
                setSubjects(sData || []);
                const yearList = [...new Set([...(yData || []).map(String), String(new Date().getFullYear())])].sort((a, b) => b - a);
                setYears(yearList);
            } catch (error) {
                console.error("Error loading initialization data:", error);
            }
        }
    };

    const pushToGoogleForm = async () => {
        const programName = programs.find(p => p.id === formData.program_id)?.name || "N/A";
        const courseName = courses.find(c => c.id === formData.course_id)?.name || "N/A";
        const subjectName = subjects.find(s => s.id === formData.subject_id)?.name || "N/A";

        const assessmentPayload = {
            assessment_meta: {
                title: formData.title,
                description: formData.description,
                program_name: programName,
                course_name: courseName,
                subject_name: subjectName,
                subject_year: formData.year,
                video_url: formData.video_url,
                image_url: formData.image_url,
                confirmation_message: formData.confirmation_message,
                shuffle_questions: formData.shuffle_questions,
                collectResponses: formData.is_published,
                collect_emails: formData.collect_emails,
                limit_response: formData.limit_response,
                edit_after_submit: formData.edit_after_submit,
                show_progress_bar: formData.show_progress_bar,
                link_to_sheet: formData.link_to_sheet
            },
            student_fields: {
                full_name: formData.require_full_name,
                mobile: formData.require_mobile,
                industry: formData.require_industry
            },
            questions: (selectedQuestions || []).map((q, i) => {
                const optionsMap = {};
                (q.options || []).forEach(opt => {
                    if (opt.option_label) {
                        optionsMap[opt.option_label] = opt.option_text || "";
                    }
                });

                return {
                    question_text: q.question_text || "Empty Question",
                    options: optionsMap,
                    correct_option: (q.options || []).find(opt => !!opt.is_correct)?.option_label || "A",
                    marks: q.positive_marks || 1,
                    explanation: q.explanation || ""
                };
            })
        };

        console.log("--- GOOGLE FORM PAYLOAD ---");
        console.log("Questions Count:", assessmentPayload.questions.length);
        console.log("Payload:", JSON.stringify(assessmentPayload, null, 2));

        if (assessmentPayload.questions.length === 0) {
            console.error("CRITICAL: Attempting to create quiz with 0 questions!");
        }

        const response = await fetch('/api/google-form-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assessmentPayload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Proxy Error Response:", errorData);
            throw new Error(errorData.details || "Failed to push to Google Form");
        }
        return await response.json();
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        let googleLinks = { editorLink: "", respondentLink: "" };

        try {
            if (formData.push_to_google) {
                setIsPushingToGoogle(true);
                try {
                    const result = await pushToGoogleForm();

                    // Robust handling to get distinct links
                    let editorUrl = result.editorUrl || result.editUrl || result.formUrl || "";
                    let responderUrl = result.responderUrl || result.publishedUrl || result.viewUrl || result.formUrl || "";
                    let sheetUrl = result.sheetUrl || "";

                    if (sheetUrl) {
                        toast({ description: "Google Sheet linked successfully!", duration: 5000 });
                        console.log("Linked Sheet:", sheetUrl);
                    }

                    // If we have identical links (likely just the formUrl), try to deduce the correct suffixes
                    if (editorUrl && editorUrl === responderUrl && editorUrl.includes('docs.google.com/forms')) {
                        if (editorUrl.endsWith('/edit')) {
                            // We have the edit link, deduce responder link
                            responderUrl = editorUrl.replace(/\/edit$/, '/viewform');
                        } else if (editorUrl.endsWith('/viewform')) {
                            // We have the view link, deduce editor link
                            editorUrl = responderUrl.replace(/\/viewform$/, '/edit');
                        } else {
                            // Base URL provided, append standard suffixes
                            // Check if it ends with slash or not to avoid double slash, though Google forms usually strictly formatted
                            // Safest to just default to formUrl if we can't safely regex, but let's try assuming /edit default
                            if (!editorUrl.includes('/edit') && !editorUrl.includes('/viewform')) {
                                responderUrl = `${editorUrl.replace(/\/$/, '')}/viewform`;
                                editorUrl = `${editorUrl.replace(/\/$/, '')}/edit`;
                            }
                        }
                    }

                    googleLinks = {
                        editorLink: editorUrl,
                        respondentLink: responderUrl
                    };
                    toast({ description: "Google Form created successfully!" });
                } catch (error) {
                    console.error("Google Form Push Error:", error);
                    toast({
                        variant: "destructive",
                        description: "Failed to create Google Form. Creating local record only."
                    });
                } finally {
                    setIsPushingToGoogle(false);
                }
            }

            const examEntity = new Exam();
            const examQuestionEntity = new ExamQuestion();

            let newExam = await examEntity.create({
                title: formData.title,
                is_published: formData.is_published,
                type: formData.exam_type, // DB constraint removed, saving raw type
                course_id: formData.course_id || null,
                editor_link: googleLinks.editorLink, // Will be empty if not pushing to Google
                respondent_link: googleLinks.respondentLink, // Will be empty if not pushing to Google
                created_at: new Date().toISOString()
            });

            // If not pushing to Google, generate and save internal links
            if (!formData.push_to_google) {
                const baseUrl = window.location.origin;
                const internalEditorLink = `${baseUrl}/questions?exam_id=${newExam.id}`; // Placeholder for internal edit
                const internalRespondentLink = `${baseUrl}/attempt/${newExam.id}`; // Placeholder for internal attempt

                newExam = await examEntity.update(newExam.id, {
                    editor_link: internalEditorLink,
                    respondent_link: internalRespondentLink
                });
            }

            for (const question of selectedQuestions) {
                await examQuestionEntity.create({ exam_id: newExam.id, question_id: question.id });
            }

            toast({ description: "Quiz launched successfully!" });
            onQuizCreated();
            onClose();
        } catch (error) {
            console.error("Error creating quiz:", error);
            toast({ variant: "destructive", description: "Failed to launch quiz." });
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && !formData.title) {
            toast({ variant: "destructive", description: "Title is required" });
            return;
        }
        setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => s - 1);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden border-0 shadow-3xl rounded-[2.5rem]">
                {/* Header */}
                <div className="relative">
                    <DialogHeader className="px-10 py-10 bg-gradient-to-br from-[#069494] via-[#057a7a] to-[#046161] text-white overflow-hidden">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
                                    <Trophy className="w-8 h-8 text-teal-50" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black tracking-tight mb-2">Launch Assessment</DialogTitle>
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-white/20 text-white border-0 px-4 py-1.5 font-bold rounded-lg backdrop-blur-md">
                                            {selectedQuestions.length} Questions
                                        </Badge>
                                        <Badge className="bg-amber-400/80 text-amber-950 border-0 px-4 py-1.5 font-bold rounded-lg">
                                            {totalMarks} Marks
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-3 bg-white/5 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={cn(
                                            "w-2.5 h-2.5 rounded-full transition-all duration-700",
                                            step >= s ? "bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "bg-white/20"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-[-40%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-[-20%] left-[-5%] w-64 h-64 bg-teal-400/10 rounded-full blur-[80px]" />
                    </DialogHeader>
                    <div className="h-2 w-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full bg-[#069494] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(6,148,148,0.5)]"
                            style={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="px-10 py-10 bg-white min-h-[550px] overflow-y-auto">
                    {/* Step 1: Content & Media */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Assessment Title <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="e.g., Weekly Digital Marketing Quiz"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="h-16 bg-slate-50 border-2 border-transparent focus:border-[#069494] focus:ring-0 rounded-2xl text-xl font-bold px-6 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Instructions (Google Forms Only)</Label>
                                        <Textarea
                                            placeholder="These instructions will only appear on the Google Form..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="min-h-[160px] bg-slate-50 border-2 border-transparent focus:border-[#069494] focus:ring-0 rounded-2xl p-6 text-base resize-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8 p-8 bg-teal-50/30 rounded-[2.5rem] border border-teal-100/50">
                                    <h3 className="text-xl font-black text-[#046161] flex items-center gap-3">
                                        <div className="p-2.5 bg-[#069494] rounded-xl text-white">
                                            <Video className="w-5 h-5" />
                                        </div>
                                        Multimedia Setup
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-teal-700 ml-1">Video Link (Intro Video)</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="YouTube/Vimeo URL"
                                                    value={formData.video_url}
                                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                                    className="h-14 bg-white border-none ring-1 ring-teal-100 focus:ring-2 focus:ring-[#069494] rounded-xl px-12 transition-all"
                                                />
                                                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-teal-700 ml-1">Banner Image URL</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="Assessment header image"
                                                    value={formData.image_url}
                                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                    className="h-14 bg-white border-none ring-1 ring-teal-100 focus:ring-2 focus:ring-[#069494] rounded-xl px-12 transition-all"
                                                />
                                                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/60 rounded-2xl border border-teal-100/30 flex items-start gap-3">
                                        <Info className="w-5 h-5 text-teal-500 mt-0.5" />
                                        <p className="text-xs text-teal-600 leading-relaxed font-medium">Adding multimedia can increase student engagement by up to 40% based on recent metrics.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Categorization & Student Info */}
                    {step === 2 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-teal-100 rounded-2xl text-[#069494]">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Assesement specification</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Program</Label>
                                            <Select value={formData.program_id} onValueChange={(v) => setFormData({ ...formData, program_id: v })}>
                                                <SelectTrigger className="h-14 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#069494] rounded-xl px-5 font-bold text-slate-700 transition-all"><SelectValue placeholder="Prog" /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-2xl border-none p-2">{programs.map(p => <SelectItem key={p.id} value={p.id} className="font-semibold rounded-lg py-3">{p.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Course</Label>
                                            <Select value={formData.course_id} onValueChange={(v) => setFormData({ ...formData, course_id: v })}>
                                                <SelectTrigger className="h-14 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#069494] rounded-xl px-5 font-bold text-slate-700 transition-all"><SelectValue placeholder="Course" /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-2xl border-none p-2">{courses.map(c => <SelectItem key={c.id} value={c.id} className="font-semibold rounded-lg py-3">{c.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subject</Label>
                                            <Select value={formData.subject_id} onValueChange={(v) => setFormData({ ...formData, subject_id: v })}>
                                                <SelectTrigger className="h-14 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#069494] rounded-xl px-5 font-bold text-slate-700 transition-all"><SelectValue placeholder="Subject" /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-2xl border-none p-2">{subjects.map(s => <SelectItem key={s.id} value={s.id} className="font-semibold rounded-lg py-3">{s.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Year</Label>
                                            <Select value={formData.year} onValueChange={(v) => setFormData({ ...formData, year: v })}>
                                                <SelectTrigger className="h-14 bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#069494] rounded-xl px-5 font-bold text-slate-700 transition-all"><SelectValue /></SelectTrigger>
                                                <SelectContent className="rounded-2xl shadow-2xl border-none p-2">{years.map(y => <SelectItem key={y} value={y} className="font-semibold rounded-lg py-3">{y}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                                            <UserCheck className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Form Fields</h3>
                                    </div>
                                    <div className="space-y-4 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                    <UserCheck className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-slate-600">Full Name</span>
                                            </div>
                                            <Switch checked={formData.require_full_name} onCheckedChange={(v) => setFormData({ ...formData, require_full_name: v })} className="data-[state=checked]:bg-[#069494]" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                    <Smartphone className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-slate-600">Mobile Number</span>
                                            </div>
                                            <Switch checked={formData.require_mobile} onCheckedChange={(v) => setFormData({ ...formData, require_mobile: v })} className="data-[state=checked]:bg-[#069494]" />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-black text-slate-600">Industry Name</span>
                                            </div>
                                            <Switch checked={formData.require_industry} onCheckedChange={(v) => setFormData({ ...formData, require_industry: v })} className="data-[state=checked]:bg-[#069494]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Advanced Settings & Launch */}
                    {step === 3 && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-700">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                                        <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        Advanced Configuration
                                    </h3>
                                    <div className="p-8 bg-slate-50 border border-slate-100 shadow-inner rounded-[3rem] space-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Post-Submission Message</Label>
                                            <Input
                                                placeholder="Thank you for your response!"
                                                value={formData.confirmation_message}
                                                onChange={(e) => setFormData({ ...formData, confirmation_message: e.target.value })}
                                                className="h-14 bg-white border-2 border-transparent focus:border-[#069494] focus:ring-0 rounded-2xl px-6 font-semibold text-slate-700 shadow-sm transition-all"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-200/60">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-amber-50 rounded-2xl"><Shuffle className="w-5 h-5 text-amber-600" /></div>
                                                <div><p className="font-black text-slate-700 text-base">Shuffle Order</p><p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Randomize for each student</p></div>
                                            </div>
                                            <Switch checked={formData.shuffle_questions} onCheckedChange={(v) => setFormData({ ...formData, shuffle_questions: v })} className="data-[state=checked]:bg-[#069494]" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200/60">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-xl"><UserCheck className="w-4 h-4 text-slate-500" /></div>
                                                    <span className="font-bold text-slate-700 text-sm">Collect Emails</span>
                                                </div>
                                                <Switch checked={formData.collect_emails} onCheckedChange={(v) => setFormData({ ...formData, collect_emails: v })} className="data-[state=checked]:bg-[#069494]" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-xl"><UserCheck className="w-4 h-4 text-slate-500" /></div>
                                                    <span className="font-bold text-slate-700 text-sm">Limit to 1 Response</span>
                                                </div>
                                                <Switch checked={formData.limit_response} onCheckedChange={(v) => setFormData({ ...formData, limit_response: v })} className="data-[state=checked]:bg-[#069494]" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-xl"><FileText className="w-4 h-4 text-slate-500" /></div>
                                                    <span className="font-bold text-slate-700 text-sm">Edit After Submit</span>
                                                </div>
                                                <Switch checked={formData.edit_after_submit} onCheckedChange={(v) => setFormData({ ...formData, edit_after_submit: v })} className="data-[state=checked]:bg-[#069494]" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 rounded-xl"><Clock className="w-4 h-4 text-slate-500" /></div>
                                                    <span className="font-bold text-slate-700 text-sm">Progress Bar</span>
                                                </div>
                                                <Switch checked={formData.show_progress_bar} onCheckedChange={(v) => setFormData({ ...formData, show_progress_bar: v })} className="data-[state=checked]:bg-[#069494]" />
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-200/60">
                                            <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                                                <div className="space-y-2">
                                                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Duration (Min)</Label>
                                                    <div className="flex items-center gap-4 p-1.5 bg-slate-50 rounded-2xl border-2 border-slate-50">
                                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-[#069494] bg-white rounded-xl shadow-sm" onClick={() => setFormData(f => ({ ...f, duration_minutes: Math.max(5, f.duration_minutes - 5) }))}>-</Button>
                                                        <span className="font-black text-slate-900 w-10 text-center text-2xl">{formData.duration_minutes}</span>
                                                        <Button size="icon" variant="ghost" className="h-10 w-10 text-[#069494] bg-white rounded-xl shadow-sm" onClick={() => setFormData(f => ({ ...f, duration_minutes: f.duration_minutes + 5 }))}>+</Button>
                                                    </div>
                                                </div>
                                                <div className="h-16 w-px bg-slate-100 mx-2" />
                                                <div className="text-right">
                                                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mr-1">Status</Label>
                                                    <div className="flex items-center gap-2 text-emerald-600 mt-1">
                                                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        <span className="text-sm font-black uppercase tracking-tight">Ready</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Immediate Launch</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                                        <div className="p-3 bg-teal-100 rounded-2xl text-[#069494]">
                                            <Share2 className="w-6 h-6" />
                                        </div>
                                        Integrations
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="p-8 bg-teal-50/30 rounded-[3rem] border border-teal-100/50 flex items-center justify-between group transition-all hover:bg-teal-50/50">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-teal-50">
                                                    <img src="https://www.gstatic.com/images/branding/product/1x/forms_48dp.png" alt="Google Forms" className="w-8 h-8 object-contain" />
                                                </div>
                                                <div><p className="font-black text-[#046161] text-lg">Google Sync</p><p className="text-[11px] text-[#069494] font-bold uppercase tracking-wider">Automated GAS Flow</p></div>
                                            </div>
                                            <Switch checked={formData.push_to_google} onCheckedChange={(v) => setFormData(f => ({ ...f, push_to_google: v }))} className="data-[state=checked]:bg-[#069494]" />
                                        </div>

                                        {formData.push_to_google && (
                                            <div className="p-6 bg-slate-50/80 rounded-[2rem] border border-slate-200/50 flex items-center justify-between transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-700 text-sm">Link via Sheets</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Auto-export responses</p>
                                                    </div>
                                                </div>
                                                <Switch checked={formData.link_to_sheet} onCheckedChange={(v) => setFormData({ ...formData, link_to_sheet: v })} className="data-[state=checked]:bg-green-500" />
                                            </div>
                                        )}
                                        <div className="p-8 bg-emerald-50/30 rounded-[3rem] border border-emerald-100/50 flex items-center justify-between group transition-all hover:bg-emerald-50/50">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-emerald-50">
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                                </div>
                                                <div><p className="font-black text-emerald-900 text-lg">Live Visibility</p><p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">Public Access Enabled</p></div>
                                            </div>
                                            <Switch checked={formData.is_published} onCheckedChange={(v) => setFormData(f => ({ ...f, is_published: v }))} className="data-[state=checked]:bg-emerald-500" />
                                        </div>
                                        <div className="pt-4 flex justify-center">
                                            <div className="px-8 py-3 bg-white border-2 border-teal-100 text-[#069494] font-black rounded-2xl text-sm shadow-sm ring-4 ring-teal-50/50">
                                                {formData.exam_type.replace('_', ' ').toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <DialogFooter className="px-10 py-10 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-6 sm:justify-between">
                    <div className="flex items-center gap-4">
                        {step > 1 && (
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="h-16 px-8 rounded-2xl font-black text-slate-500 hover:text-[#069494] hover:bg-teal-50 transition-all duration-300 group"
                                disabled={isLoading}
                            >
                                <ChevronLeft className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" />
                                Back
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="h-16 px-10 border-2 border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/50 rounded-2xl font-black transition-all"
                        >
                            Cancel
                        </Button>
                        {step < 3 ? (
                            <Button
                                onClick={nextStep}
                                className="h-16 flex-1 sm:flex-none px-14 bg-[#069494] hover:bg-[#057a7a] text-white font-black shadow-[0_15px_30px_rgba(6,148,148,0.25)] hover:shadow-[0_20px_40px_rgba(6,148,148,0.35)] rounded-2xl transition-all duration-300 group"
                            >
                                Next Step
                                <ChevronRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading || selectedQuestions.length === 0}
                                className="h-16 flex-1 sm:flex-none px-14 bg-[#069494] hover:bg-[#057a7a] text-white font-black shadow-[0_15px_30px_rgba(6,148,148,0.25)] hover:shadow-[0_20px_40px_rgba(6,148,148,0.35)] rounded-2xl relative overflow-hidden transition-all duration-500 group active:scale-95"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <span className="relative z-10 flex items-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            {isPushingToGoogle ? "Pushing to GAS..." : "Launching..."}
                                        </>
                                    ) : (
                                        <>
                                            Confirm & Launch
                                            <CheckCircle2 className="w-6 h-6 transition-transform group-hover:scale-110" />
                                        </>
                                    )}
                                </span>
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}
