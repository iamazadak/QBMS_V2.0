import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Premium KPI Card component inspired by Testbook.com
 * @param {Object} props
 * @param {string} props.label - The label of the metric
 * @param {string|number} props.value - The main value to display
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.color - Theme color (indigo, teal, amber, rose, violet, emerald, etc.)
 * @param {string} props.description - Small description text at the bottom
 * @param {string|number} props.trend - Optional trend percentage or text
 * @param {React.ReactNode} props.trendIcon - Optional icon for trend
 */
export default function KpiCard({
    label,
    value,
    icon: Icon,
    color = "teal",
    description,
    trend,
    trendIcon: TrendIcon
}) {
    // Define color mappings for Tailwind classes
    const colorClasses = {
        indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-500",
        teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-500",
        amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500",
        rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-500",
        violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-500",
        emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500",
        blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-500",
        slate: "bg-slate-50 text-slate-600 group-hover:bg-slate-500",
    };

    const badgeClasses = {
        indigo: "border-indigo-100 text-indigo-600 bg-indigo-50",
        teal: "border-teal-100 text-teal-600 bg-teal-50",
        amber: "border-amber-100 text-amber-600 bg-amber-50",
        rose: "border-rose-100 text-rose-600 bg-rose-50",
        violet: "border-violet-100 text-violet-600 bg-violet-50",
        emerald: "border-emerald-100 text-emerald-700 bg-emerald-50",
        blue: "border-blue-100 text-blue-600 bg-blue-50",
        slate: "border-slate-100 text-slate-600 bg-slate-50",
    };

    const selectedColorClass = colorClasses[color] || colorClasses.teal;
    const selectedBadgeClass = badgeClasses[color] || badgeClasses.teal;

    return (
        <Card className="group overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-300 rounded-[2rem] bg-white">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl transition-colors duration-300 group-hover:text-white ${selectedColorClass}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <Badge variant="outline" className={`font-black text-[10px] uppercase tracking-wider py-0.5 px-2 ${selectedBadgeClass}`}>
                            {TrendIcon && <TrendIcon className="w-3 h-3 mr-1 inline" />}
                            {trend}
                        </Badge>
                    )}
                </div>
                <div>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 ml-1">{label}</p>
                    {description && (
                        <div className="mt-4 flex items-center gap-1 text-[10px] text-slate-400 font-bold italic leading-none">
                            {description}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
